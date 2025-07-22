# UIResourceRenderer Component

The `<UIResourceRenderer />` component is the **main entry point** for rendering MCP-UI resources in your React application. It automatically detects the resource type and renders the appropriate component internally.

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
  
  **Asynchronous Communication**: When actions include a `messageId`, the iframe automatically receives response messages (`ui-action-received`, `ui-action-response`, `ui-action-error`). See [Protocol Details](../protocol-details.md#asynchronous-communication-with-message-ids) for examples.
- **`supportedContentTypes`**: Optional array to restrict which content types are allowed (`['rawHtml', 'externalUrl', 'remoteDom']`)
- **`htmlProps`**: Optional props for the `<HTMLResourceRenderer>`
  - **`style`**: Optional custom styles for iframe-based resources
  - **`proxy`**: Optional. A URL to a static "proxy" script for rendering external URLs. See [Using a Proxy for External URLs](./using-a-proxy.md) for details.
  - **`iframeProps`**: Optional props passed to iframe elements (for HTML/URL resources)
    - **`ref`**: Optional React ref to access the underlying iframe element
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

See [Client SDK Usage & Examples](./usage-examples.md) for complete working examples.
