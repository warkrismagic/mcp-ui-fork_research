# HTMLResourceRenderer Component

The `<HTMLResourceRenderer />` component is an internal component used by `<UIResourceRenderer />` to render HTML and URL-based resources.

## Props

```typescript
import type { Resource } from '@modelcontextprotocol/sdk/types';

export interface HTMLResourceRendererProps {
  resource: Partial<Resource>;
  onUIAction?: (result: UIActionResult) => Promise<any>;
  style?: React.CSSProperties;
  proxy?: string;
  iframeProps?: Omit<React.HTMLAttributes<HTMLIFrameElement>, 'src' | 'srcDoc' | 'ref' | 'style'>;
}
```

The component accepts the following props:

- **`resource`**: The resource object from an `UIResource`. It should include `uri`, `mimeType`, and either `text` or `blob`.
- **`onUIAction`**: An optional callback that fires when the iframe content (for `ui://` resources) posts a message to your app. The message should look like:
  ```typescript
  { type: 'tool', payload: { toolName: string, params: Record<string, unknown> }, messageId?: string } |
  { type: 'intent', payload: { intent: string, params: Record<string, unknown> }, messageId?: string } |
  { type: 'prompt', payload: { prompt: string }, messageId?: string } |
  { type: 'notify', payload: { message: string }, messageId?: string } |
  { type: 'link', payload: { url: string }, messageId?: string } |
  ```
  If you don't provide a callback for a specific type, the default handler will be used.
  
  **Asynchronous Response Handling**: When a message includes a `messageId` field, the iframe will automatically receive response messages:
  - `ui-action-received`: Sent immediately when the message is received
  - `ui-action-response`: Sent when your callback resolves successfully  
  - `ui-action-error`: Sent if your callback throws an error
  
  See [Protocol Details](../protocol-details.md#asynchronous-communication-with-message-ids) for complete examples.
- **`style`**: (Optional) Custom styles for the iframe.
- **`proxy`**: (Optional) A URL to a proxy script. This is useful for hosts with a strict Content Security Policy (CSP). When provided, external URLs will be rendered in a nested iframe hosted at this URL. For example, if `proxy` is `https://my-proxy.com/`, the final URL will be `https://my-proxy.com/?url=<encoded_original_url>`. For your convenience, mcp-ui hosts a proxy script at `https://proxy.mcpui.dev`, which you can use as a the prop value without any setup (see `examples/external-url-demo`).
- **`iframeProps`**: (Optional) Custom props for the iframe.

## How It Works

1.  **Checks Content Type**: If `resource.mimeType` isn't `"text/html"` or `"text/uri-list"`, you'll see an error.
2.  **Handles URI Schemes**:
    - For resources with `mimeType: 'text/uri-list'`:
      - Expects `resource.text` or `resource.blob` to contain a single URL in URI list format
      - **MCP-UI requires a single URL**: While the format supports multiple URLs, only the first valid `http/s` URL is used
      - Multiple URLs are supported for fallback specification but will trigger warnings
      - Ignores comment lines starting with `#` and empty lines
      - If using `blob`, it decodes it from Base64.
      - Renders an `<iframe>` with its `src` set to the first valid URL.
      - If a valid URL is passed to the `proxy` prop, it will be used as the source for the iframe, which then renders the external URL in a nested iframe. For example, if `proxy` is `https://my-proxy.com/`, the final URL will be `https://my-proxy.com/?url=<encoded_original_url>`.
      - Sandbox: `allow-scripts allow-same-origin` (needed for some external sites; be mindful of security).
    - For resources with `mimeType: 'text/html'`:
      - Expects `resource.text` or `resource.blob` to contain HTML.
      - If using `blob`, it decodes it from Base64.
      - Renders an `<iframe>` with its `srcdoc` set to the HTML.
      - Sandbox: `allow-scripts`.
3.  **Listens for Messages**: Adds a global `message` event listener. If an iframe posts a message with `event.data.tool`, your `onUIAction` callback is called.

## Styling

By default, the iframe stretches to 100% width and is at least 200px tall. You can override this with the `style` prop or your own CSS.

## Example Usage

See [Client SDK Usage & Examples](./usage-examples.md) for examples using the recommended `<UIResourceRenderer />` component.

## Security Notes

- **`sandbox` attribute**: Restricts what the iframe can do. `allow-scripts` is required for JS execution. In the external URL content type, `allow-same-origin` is needed for external apps. Other than these inclusions, all other capabilities are restricted (e.g., no parent access, top-level navigations, modals, forms, etc.)
- **`postMessage` origin**: When sending messages from the iframe, always specify the target origin for safety. The component listens globally, so your iframe content should be explicit.
- **Content Sanitization**: HTML is rendered as-is. If you don't fully trust the source, sanitize the HTML before passing it in, or rely on the iframe's sandboxing.
