import {
  Base64BlobContent,
  CreateUIResourceOptions,
  HTMLTextContent,
  MimeType,
  UIActionResult,
  UIActionResultLink,
  UIActionResultNotification,
  UIActionResultPrompt,
  UIActionResultIntent,
  UIActionResultToolCall,
} from './types.js';

export type UIResource = {
  type: 'resource';
  resource: HTMLTextContent | Base64BlobContent;
};

/**
 * Robustly encodes a UTF-8 string to Base64.
 * Uses Node.js Buffer if available, otherwise TextEncoder and btoa.
 * @param str The string to encode.
 * @returns Base64 encoded string.
 */
function robustUtf8ToBase64(str: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str, 'utf-8').toString('base64');
  } else if (typeof TextEncoder !== 'undefined' && typeof btoa !== 'undefined') {
    const encoder = new TextEncoder();
    const uint8Array = encoder.encode(str);
    let binaryString = '';
    uint8Array.forEach((byte) => {
      binaryString += String.fromCharCode(byte);
    });
    return btoa(binaryString);
  } else {
    console.warn(
      'MCP-UI SDK: Buffer API and TextEncoder/btoa not available. Base64 encoding might not be UTF-8 safe.',
    );
    try {
      return btoa(str);
    } catch (e) {
      throw new Error(
        'MCP-UI SDK: Suitable UTF-8 to Base64 encoding method not found, and fallback btoa failed.',
      );
    }
  }
}

/**
 * Creates a UIResource.
 * This is the object that should be included in the 'content' array of a toolResult.
 * @param options Configuration for the interactive resource.
 * @returns a UIResource.
 */
export function createUIResource(options: CreateUIResourceOptions): UIResource {
  let actualContentString: string;
  let mimeType: MimeType;

  if (options.content.type === 'rawHtml') {
    if (!options.uri.startsWith('ui://')) {
      throw new Error("MCP-UI SDK: URI must start with 'ui://' when content.type is 'rawHtml'.");
    }
    actualContentString = options.content.htmlString;
    if (typeof actualContentString !== 'string') {
      throw new Error(
        "MCP-UI SDK: content.htmlString must be provided as a string when content.type is 'rawHtml'.",
      );
    }
    mimeType = 'text/html';
  } else if (options.content.type === 'externalUrl') {
    if (!options.uri.startsWith('ui://')) {
      throw new Error(
        "MCP-UI SDK: URI must start with 'ui://' when content.type is 'externalUrl'.",
      );
    }
    actualContentString = options.content.iframeUrl;
    if (typeof actualContentString !== 'string') {
      throw new Error(
        "MCP-UI SDK: content.iframeUrl must be provided as a string when content.type is 'externalUrl'.",
      );
    }
    mimeType = 'text/uri-list';
  } else if (options.content.type === 'remoteDom') {
    if (!options.uri.startsWith('ui://')) {
      throw new Error("MCP-UI SDK: URI must start with 'ui://' when content.type is 'remoteDom'.");
    }
    actualContentString = options.content.script;
    if (typeof actualContentString !== 'string') {
      throw new Error(
        "MCP-UI SDK: content.script must be provided as a string when content.type is 'remoteDom'.",
      );
    }
    mimeType = `application/vnd.mcp-ui.remote-dom+javascript; framework=${options.content.framework}`;
  } else {
    // This case should ideally be prevented by TypeScript's discriminated union checks
    const exhaustiveCheckContent: never = options.content;
    throw new Error(`MCP-UI SDK: Invalid content.type specified: ${exhaustiveCheckContent}`);
  }

  let resource: UIResource['resource'];

  switch (options.encoding) {
    case 'text':
      resource = {
        uri: options.uri,
        mimeType: mimeType as MimeType,
        text: actualContentString,
      };
      break;
    case 'blob':
      resource = {
        uri: options.uri,
        mimeType: mimeType as MimeType,
        blob: robustUtf8ToBase64(actualContentString),
      };
      break;
    default: {
      const exhaustiveCheck: never = options.encoding;
      throw new Error(`MCP-UI SDK: Invalid encoding type: ${exhaustiveCheck}`);
    }
  }

  return {
    type: 'resource',
    resource: resource,
  };
}

export type { CreateUIResourceOptions, ResourceContentPayload, UIActionResult } from './types.js';

export function postUIActionResult(result: UIActionResult): void {
  if (window.parent) {
    window.parent.postMessage(result, '*');
  }
}

export const InternalMessageType = {
  UI_ACTION_RECEIVED: 'ui-action-received',
  UI_ACTION_RESPONSE: 'ui-action-response',
  UI_ACTION_ERROR: 'ui-action-error',
};

export function uiActionResultToolCall(
  toolName: string,
  params: Record<string, unknown>,
): UIActionResultToolCall {
  return {
    type: 'tool',
    payload: {
      toolName,
      params,
    },
  };
}

export function uiActionResultPrompt(prompt: string): UIActionResultPrompt {
  return {
    type: 'prompt',
    payload: {
      prompt,
    },
  };
}

export function uiActionResultLink(url: string): UIActionResultLink {
  return {
    type: 'link',
    payload: {
      url,
    },
  };
}

export function uiActionResultIntent(
  intent: string,
  params: Record<string, unknown>,
): UIActionResultIntent {
  return {
    type: 'intent',
    payload: {
      intent,
      params,
    },
  };
}

export function uiActionResultNotification(message: string): UIActionResultNotification {
  return {
    type: 'notify',
    payload: {
      message,
    },
  };
}
