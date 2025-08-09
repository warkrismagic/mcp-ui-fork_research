# UIResourceRenderer Component

The `UIResourceRenderer` component is the **main entry point** for rendering MCP-UI resources in your application. It automatically detects the resource type and renders the appropriate component internally.
It is available as a React component and as a Web Component.

## React Component

React applications may use the `<UIResourceRenderer />` component.

## Web Component

For developers using frameworks other than React, a Web Component version is available. It can be used as a standard HTML element (`<ui-resource-renderer>`) and styled with regular CSS.

[**» See the Web Component Usage & Examples for more details**](./wc-usage-examples.md)

## Why use `UIResourceRenderer`?

- **Automatic Type Detection**: Inspects the resource's `mimeType` and `contentType` to determine the appropriate rendering method
- **Future-Proof**: Handles new resource types as they're added to the MCP-UI specification
- **Unified API**: Single component interface for all resource types
- **Security**: Maintains sandboxing and security features across all resource types

## Supported Resource Types

`UIResourceRenderer` automatically handles:

- **HTML Resources** (`text/html`): Direct HTML content rendered in sandboxed iframes
- **External URLs** (`text/uri-list`): External applications and websites
- **Remote DOM Resources** (`application/vnd.mcp-ui.remote-dom`): Server-generated UI components using Shopify's remote-dom

## Props

```typescript
import type { Resource } from '@modelcontextprotocol/sdk/types';

interface UIResourceRendererProps {
  resource: Partial<Resource>;
  onUIAction?: (result: UIActionResult) => Promise<unknown>;
  supportedContentTypes?: ResourceContentType[];
  htmlProps?: Omit<HTMLResourceRendererProps, 'resource' | 'onUIAction'>;
  remoteDomProps?: Omit<RemoteDOMResourceProps, 'resource' | 'onUIAction'>;
}
```

### Props Details

- **`resource`**: The resource object from an MCP response. Should include `uri`, `mimeType`, and content (`text`, `blob`, or `content`)
- **`onUIAction`**: Optional callback for handling UI actions from the resource:
  ```typescript
  { type: 'tool', payload: { toolName: string, params: Record<string, unknown> }, messageId?: string } |
  { type: 'intent', payload: { intent: string, params: Record<string, unknown> }, messageId?: string } |
  { type: 'prompt', payload: { prompt: string }, messageId?: string } |
  { type: 'notify', payload: { message: string }, messageId?: string } |
  { type: 'link', payload: { url: string }, messageId?: string }
  ```
  
  **Asynchronous Communication**: When actions include a `messageId`, the iframe automatically receives response messages (`ui-message-received`, `ui-message-response`). See [Protocol Details](../protocol-details.md#asynchronous-communication-with-message-ids) for examples.
- **`supportedContentTypes`**: Optional array to restrict which content types are allowed (`['rawHtml', 'externalUrl', 'remoteDom']`)
- **`htmlProps`**: Optional props for the `<HTMLResourceRenderer>`
  - **`style`**: Optional custom styles for iframe-based resources
  - **`proxy`**: Optional. A URL to a static "proxy" script for rendering external URLs. See [Using a Proxy for External URLs](./using-a-proxy.md) for details.
  - **`iframeProps`**: Optional props passed to iframe elements (for HTML/URL resources)
    - **`ref`**: Optional React ref to access the underlying iframe element
  - **`iframeRenderData`**: Optional `Record<string, unknown>` to pass data to the iframe upon rendering. This enables advanced use cases where the parent application needs to provide initial state or configuration to the sandboxed iframe content.
  - **`autoResizeIframe`**: Optional `boolean | { width?: boolean; height?: boolean }` to automatically resize the iframe to the size of the content.
- **`remoteDomProps`**: Optional props for the `<RemoteDOMResourceRenderer>`
  - **`library`**: Optional component library for Remote DOM resources (defaults to `basicComponentLibrary`)
  - **`remoteElements`**: Optional remote element definitions for Remote DOM resources. REQUIRED for Remote DOM snippets.

See [Custom Component Libraries](./custom-component-libraries.md) for a detailed guide on how to create and use your own libraries for `remoteDom` resources.

## Basic Usage

```tsx
import React from 'react';
import { UIResourceRenderer, UIActionResult } from '@mcp-ui/client';

function App({ mcpResource }) {
  const handleUIAction = async (result: UIActionResult) => {
    switch (result.type) {
      case 'tool':
        console.log('Tool call:', result.payload.toolName, result.payload.params);
        // Handle tool execution
        break;
      case 'prompt':
        console.log('Prompt:', result.payload.prompt);
        // Handle prompt display
        break;
      case 'link':
        console.log('Link:', result.payload.url);
        // Handle link navigation
        break;
      case 'intent':
        console.log('Intent:', result.payload.intent, result.payload.params);
        // Handle intent processing
        break;
      case 'notify':
        console.log('Notification:', result.payload.message);
        // Handle notification display
        break;
    }
    return { status: 'handled' };
  };

  if (
    mcpResource.type === 'resource' &&
    mcpResource.resource.uri?.startsWith('ui://')
  ) {
    return (
      <UIResourceRenderer
        resource={mcpResource.resource}
        onUIAction={handleUIAction}
      />
    );
  }
  
  return <p>Unsupported resource</p>;
}
```

## Advanced Usage

### Content Type Restrictions

```tsx
// Only allow HTML resources (block external URLs and Remote DOM)
<UIResourceRenderer
  resource={mcpResource.resource}
  supportedContentTypes={['rawHtml']}
  onUIAction={handleUIAction}
/>
```

### Custom Styling

```tsx
<UIResourceRenderer
  resource={mcpResource.resource}
  htmlProps={{
    style: { 
      border: '2px solid #007acc',
      borderRadius: '8px',
      minHeight: '400px'
    },
    iframeProps: {
      title: 'Custom MCP Resource',
      className: 'mcp-resource-frame'
    }
  }}
  onUIAction={handleUIAction}
/>
```

### Passing Render-Time Data to Iframes

The `iframeRenderData` prop allows you to send a data payload to an iframe as it renders. This is useful for initializing the iframe with dynamic data from the parent application.

When `iframeRenderData` is provided:
1. The iframe's URL will automatically include `?waitForRenderData=true`. The iframe's internal script can use this to know it should wait for data instead of immediately rendering.
2. The data is sent to the iframe via `postMessage` using a dual-mechanism approach to ensure reliable delivery:
    - **On Load**: A `ui-lifecycle-iframe-render-data` message is sent as soon as the iframe's `onLoad` event fires.
    - **On Ready**: If the iframe sends a `ui-lifecycle-iframe-ready` message, the parent will respond with the same `ui-lifecycle-iframe-render-data` payload.

This ensures the data is delivered whether the iframe is ready immediately or needs to perform setup work first.

```tsx
<UIResourceRenderer
  resource={mcpResource.resource}
  htmlProps={{
    iframeRenderData: {
      theme: 'dark',
      user: { id: '123', name: 'John Doe' }
    }
  }}
  onUIAction={handleUIAction}
/>
```

Inside the iframe, you can listen for this data:

```javascript
// In the iframe's script

// If the iframe needs to do async work, it can tell the parent when it's ready
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('waitForRenderData') === 'true') {
  let customRenderData = null;

  // The parent will send this message on load or when we notify it we're ready
  window.addEventListener('message', (event) => {
    // Add origin checks for security
    if (event.data.type === 'ui-lifecycle-iframe-render-data') {
      // If the iframe has already received data, we don't need to do anything
      if(customRenderData) {
        return;
      } else {
        customRenderData = event.data.payload.renderData;
        // Now you can render the UI with the received data
        renderUI(customRenderData);
      }
    }
  });
  // We can let the parent know we're ready to receive data
  window.parent.postMessage({ type: 'ui-lifecycle-iframe-ready' }, '*');
} else {
  // If the iframe doesn't need to wait for data, we can render the default UI immediately
  renderUI();
}
```

### Automatically Resizing the Iframe

The `autoResizeIframe` prop allows you to automatically resize the iframe to the size of the content.

```tsx
<UIResourceRenderer
  resource={mcpResource.resource}
  htmlProps={{
    autoResizeIframe: true,
  }}
  onUIAction={handleUIAction}
/>
```

The `autoResizeIframe` prop can be a boolean or an object with the following properties:

- **`width`**: Optional boolean to automatically resize the iframe's width to the size of the content.
- **`height`**: Optional boolean to automatically resize the iframe's height to the size of the content.

If `autoResizeIframe` is a boolean, the iframe will be resized to the size of the content.

Inside the iframe, you can listen for the `ui-size-change` message and resize the iframe to the size of the content.

```javascript
const resizeObserver = new ResizeObserver((entries) => {
  entries.forEach((entry) => {
    window.parent.postMessage(
      {
        type: "ui-size-change",
        payload: {
          height: entry.contentRect.height,
        },
      },
      "*",
    );
  });
});

resizeObserver.observe(document.documentElement)
```

See [Automatically Resizing the Iframe](./html-resource.md#automatically-resizing-the-iframe) for a more detailed example.

### Accessing the Iframe Element

You can pass a ref through `iframeProps` to access the underlying iframe element:

```tsx
import React, { useRef } from 'react';

function MyComponent({ mcpResource }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleFocus = () => {
    // Access the iframe element directly
    if (iframeRef.current) {
      iframeRef.current.focus();
    }
  };

  return (
    <div>
      <button onClick={handleFocus}>Focus Iframe</button>
      <UIResourceRenderer
        resource={mcpResource.resource}
        htmlProps={{
          iframeProps: {
            ref: iframeRef,
            title: 'MCP Resource'
          }
        }}
        onUIAction={handleUIAction}
      />
    </div>
  );
}
```

## Resource Type Detection

`UIResourceRenderer` determines the resource type using this logic:

1. **Explicit `contentType`**: If `resource.contentType` is set, use it directly
2. **MIME Type Detection**:
   - `text/html` → `rawHtml`
   - `text/uri-list` → `externalUrl`
   - `application/vnd.mcp-ui.remote-dom+javascript` → `remoteDom`
3. **Fallback**: Show unsupported resource error

## Error Handling

```tsx
function App({ mcpResource }) {
  if (
    mcpResource.type === 'resource' &&
    mcpResource.resource.uri?.startsWith('ui://')
  ) {
    return (
      <div>
        <h3>MCP Resource: {mcpResource.resource.uri}</h3>
        <UIResourceRenderer
          resource={mcpResource.resource}
          onUIAction={handleUIAction}
          supportedContentTypes={['rawHtml', 'externalUrl']} // Restrict types
        />
      </div>
    );
  }
  
  return <p>This resource is not a UI resource</p>;
}
```

When unsupported content types are encountered, `UIResourceRenderer` will display appropriate error messages:
- `"Unsupported content type: {type}."`
- `"Unsupported resource type."`

### Custom Component Library (for Remote DOM resources)

You can provide a custom component library to render Remote DOM resources with your own components. For a detailed guide, see [Custom Component Libraries](./custom-component-libraries.md).

```tsx
import { ComponentLibrary } from '@mcp-ui/client';
import { MyButton, MyCard } from './MyComponents';

const customLibrary: ComponentLibrary = {
  name: 'custom',
  elements: [
    { tagName: 'my-button', component: MyButton },
    { tagName: 'my-card', component: MyCard },
  ],
};

<UIResourceRenderer
  resource={mcpResource.resource}
  remoteDomProps={{
    library: customLibrary,
  }}
  onUIAction={handleUIAction}
/>
```

## Security Considerations

- **Sandboxing**: HTML and URL resources are rendered in sandboxed iframes
- **Content Restrictions**: Use `supportedContentTypes` to limit allowed resource types
- **Origin Validation**: Always validate `postMessage` origins in production
- **Content Sanitization**: Consider sanitizing HTML content for untrusted sources

## Examples

See [Client SDK Usage & Examples](./react-usage-examples.md) for complete working examples.
