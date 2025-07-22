import {
  createUIResource,
  uiActionResultToolCall,
  uiActionResultPrompt,
  uiActionResultLink,
  uiActionResultIntent,
  uiActionResultNotification,
} from '../index';

describe('@mcp-ui/server', () => {
  describe('createUIResource', () => {
    it('should create a text-based direct HTML resource', () => {
      const options = {
        uri: 'ui://test-html' as const,
        content: { type: 'rawHtml' as const, htmlString: '<p>Test</p>' },
        encoding: 'text' as const,
      };
      const resource = createUIResource(options);
      expect(resource.type).toBe('resource');
      expect(resource.resource.uri).toBe('ui://test-html');
      expect(resource.resource.mimeType).toBe('text/html');
      expect(resource.resource.text).toBe('<p>Test</p>');
      expect(resource.resource.blob).toBeUndefined();
    });

    it('should create a blob-based direct HTML resource', () => {
      const options = {
        uri: 'ui://test-html-blob' as const,
        content: { type: 'rawHtml' as const, htmlString: '<h1>Blob</h1>' },
        encoding: 'blob' as const,
      };
      const resource = createUIResource(options);
      expect(resource.resource.blob).toBe(Buffer.from('<h1>Blob</h1>').toString('base64'));
      expect(resource.resource.text).toBeUndefined();
    });

    it('should create a text-based external URL resource', () => {
      const options = {
        uri: 'ui://test-url' as const,
        content: {
          type: 'externalUrl' as const,
          iframeUrl: 'https://example.com',
        },
        encoding: 'text' as const,
      };
      const resource = createUIResource(options);
      expect(resource.resource.uri).toBe('ui://test-url');
      expect(resource.resource.mimeType).toBe('text/uri-list');
      expect(resource.resource.text).toBe('https://example.com');
      expect(resource.resource.blob).toBeUndefined();
    });

    it('should create a blob-based external URL resource', () => {
      const options = {
        uri: 'ui://test-url-blob' as const,
        content: {
          type: 'externalUrl' as const,
          iframeUrl: 'https://example.com/blob',
        },
        encoding: 'blob' as const,
      };
      const resource = createUIResource(options);
      expect(resource.resource.mimeType).toBe('text/uri-list');
      expect(resource.resource.blob).toBe(
        Buffer.from('https://example.com/blob').toString('base64'),
      );
      expect(resource.resource.text).toBeUndefined();
    });

    it('should create a blob-based direct HTML resource with correct mimetype', () => {
      const options = {
        uri: 'ui://test-html-blob' as const,
        content: { type: 'rawHtml' as const, htmlString: '<h1>Blob</h1>' },
        encoding: 'blob' as const,
      };
      const resource = createUIResource(options);
      expect(resource.resource.mimeType).toBe('text/html');
      expect(resource.resource.blob).toBe(Buffer.from('<h1>Blob</h1>').toString('base64'));
      expect(resource.resource.text).toBeUndefined();
    });

    it('should throw error for invalid URI prefix with rawHtml', () => {
      const options = {
        uri: 'invalid://test-html' as const,
        content: { type: 'rawHtml' as const, htmlString: '<p>Test</p>' },
        encoding: 'text' as const,
      };
      // @ts-expect-error We are intentionally passing an invalid URI to test the error.
      expect(() => createUIResource(options)).toThrow(
        "MCP-UI SDK: URI must start with 'ui://' when content.type is 'rawHtml'.",
      );
    });

    it('should throw error for invalid URI prefix with externalUrl', () => {
      const options = {
        uri: 'invalid://test-url' as const,
        content: {
          type: 'externalUrl' as const,
          iframeUrl: 'https://example.com',
        },
        encoding: 'text' as const,
      };
      // @ts-expect-error We are intentionally passing an invalid URI to test the error.
      expect(() => createUIResource(options)).toThrow(
        "MCP-UI SDK: URI must start with 'ui://' when content.type is 'externalUrl'.",
      );
    });

    it('should create a text-based remote DOM resource with React framework', () => {
      const options = {
        uri: 'ui://test-remote-dom-react' as const,
        content: {
          type: 'remoteDom' as const,
          script: '<p>React Component</p>',
          framework: 'react' as const,
        },
        encoding: 'text' as const,
      };
      const resource = createUIResource(options);
      expect(resource.type).toBe('resource');
      expect(resource.resource.uri).toBe('ui://test-remote-dom-react');
      expect(resource.resource.mimeType).toBe(
        'application/vnd.mcp-ui.remote-dom+javascript; framework=react',
      );
      expect(resource.resource.text).toBe('<p>React Component</p>');
      expect(resource.resource.blob).toBeUndefined();
    });

    it('should create a blob-based remote DOM resource with Web Components framework', () => {
      const options = {
        uri: 'ui://test-remote-dom-wc' as const,
        content: {
          type: 'remoteDom' as const,
          script: '<p>Web Component</p>',
          framework: 'webcomponents' as const,
        },
        encoding: 'blob' as const,
      };
      const resource = createUIResource(options);
      expect(resource.resource.mimeType).toBe(
        'application/vnd.mcp-ui.remote-dom+javascript; framework=webcomponents',
      );
      expect(resource.resource.blob).toBe(Buffer.from('<p>Web Component</p>').toString('base64'));
      expect(resource.resource.text).toBeUndefined();
    });

    it('should throw error for invalid URI prefix with remoteDom', () => {
      const options = {
        uri: 'invalid://test-remote-dom' as const,
        content: {
          type: 'remoteDom' as const,
          script: '<p>Invalid</p>',
          framework: 'react' as const,
        },
        encoding: 'text' as const,
      };
      // @ts-expect-error We are intentionally passing an invalid URI to test the error.
      expect(() => createUIResource(options)).toThrow(
        "MCP-UI SDK: URI must start with 'ui://' when content.type is 'remoteDom'.",
      );
    });

    it('should throw an error if htmlString is not a string for rawHtml', () => {
      const options = {
        uri: 'ui://test' as const,
        content: { type: 'rawHtml' as const, htmlString: null },
      };
      // @ts-expect-error intentionally passing invalid type
      expect(() => createUIResource(options)).toThrow(
        "MCP-UI SDK: content.htmlString must be provided as a string when content.type is 'rawHtml'.",
      );
    });

    it('should throw an error if iframeUrl is not a string for externalUrl', () => {
      const options = {
        uri: 'ui://test' as const,
        content: { type: 'externalUrl' as const, iframeUrl: 123 },
      };
      // @ts-expect-error intentionally passing invalid type
      expect(() => createUIResource(options)).toThrow(
        "MCP-UI SDK: content.iframeUrl must be provided as a string when content.type is 'externalUrl'.",
      );
    });

    it('should throw an error if script is not a string for remoteDom', () => {
      const options = {
        uri: 'ui://test' as const,
        content: { type: 'remoteDom' as const, framework: 'react', script: { a: 1 } },
      };
      // @ts-expect-error intentionally passing invalid type
      expect(() => createUIResource(options)).toThrow(
        "MCP-UI SDK: content.script must be provided as a string when content.type is 'remoteDom'.",
      );
    });
  });
});

describe('UI Action Result Creators', () => {
  it('should create a tool call action result', () => {
    const result = uiActionResultToolCall('testTool', { param1: 'value1' });
    expect(result).toEqual({
      type: 'tool',
      payload: {
        toolName: 'testTool',
        params: { param1: 'value1' },
      },
    });
  });

  it('should create a prompt action result', () => {
    const result = uiActionResultPrompt('Enter your name');
    expect(result).toEqual({
      type: 'prompt',
      payload: {
        prompt: 'Enter your name',
      },
    });
  });

  it('should create a link action result', () => {
    const result = uiActionResultLink('https://example.com');
    expect(result).toEqual({
      type: 'link',
      payload: {
        url: 'https://example.com',
      },
    });
  });

  it('should create an intent action result', () => {
    const result = uiActionResultIntent('doSomething', { data: 'abc' });
    expect(result).toEqual({
      type: 'intent',
      payload: {
        intent: 'doSomething',
        params: { data: 'abc' },
      },
    });
  });

  it('should create a notification action result', () => {
    const result = uiActionResultNotification('Success!');
    expect(result).toEqual({
      type: 'notify',
      payload: {
        message: 'Success!',
      },
    });
  });
});
