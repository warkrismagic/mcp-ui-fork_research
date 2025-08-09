## 📦 Model Context Protocol UI SDK

<p align="center">
  <img width="250" alt="image" src="https://github.com/user-attachments/assets/65b9698f-990f-4846-9b2d-88de91d53d4d" />
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@mcp-ui/server"><img src="https://img.shields.io/npm/v/@mcp-ui/server?label=server&color=green" alt="Server Version"></a>
  <a href="https://www.npmjs.com/package/@mcp-ui/client"><img src="https://img.shields.io/npm/v/@mcp-ui/client?label=client&color=blue" alt="Client Version"></a>
  <a href="https://rubygems.org/gems/mcp_ui_server"><img src="https://img.shields.io/gem/v/mcp_ui_server" alt="Ruby Server SDK Version"></a>
  <a href="https://gitmcp.io/idosal/mcp-ui"><img src="https://img.shields.io/endpoint?url=https://gitmcp.io/badge/idosal/mcp-ui" alt="MCP Documentation"></a>
</p>

<p align="center">
  <a href="#-whats-mcp-ui">What's mcp-ui?</a> •
  <a href="#-core-concepts">Core Concepts</a> •
  <a href="#-installation">Installation</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-walkthrough">Walkthrough</a> •
  <a href="#-examples">Examples</a> •
  <a href="#-security">Security</a> •
  <a href="#-roadmap">Roadmap</a> •
  <a href="#-contributing">Contributing</a> •
  <a href="#-license">License</a>
</p>

----

**`mcp-ui`** brings interactive web components to the [Model Context Protocol](https://modelcontextprotocol.io/introduction) (MCP). Deliver rich, dynamic UI resources directly from your MCP server to be rendered by the client. Take AI interaction to the next level!

> *This project is an experimental community playground for MCP UI ideas. Expect rapid iteration and enhancements!*

<p align="center">
  <video src="https://github.com/user-attachments/assets/7180c822-2dd9-4f38-9d3e-b67679509483"></video>
</p>

## 💡 What's `mcp-ui`?

`mcp-ui` is a collection of SDKs comprising:

* **`@mcp-ui/server` (TypeScript)**: Utilities to generate UI resources (`UIResource`) on your MCP server.
* **`@mcp-ui/client` (TypeScript)**: UI components (e.g., `<UIResourceRenderer />`) to render the UI resources and handle their events.
* **`mcp_ui_server` (Ruby)**: Utilities to generate UI resources on your MCP server in a Ruby environment.

Together, they let you define reusable UI snippets on the server side, seamlessly and securely render them in the client, and react to their actions in the MCP host environment.

## ✨ Core Concepts

In essence, by using `mcp-ui` SDKs, servers and hosts can agree on contracts that enable them to create and render interactive UI snippets (as a path to a standardized UI approach in MCP).

### UI Resource
The primary payload returned from the server to the client is the `UIResource`:

```ts
interface UIResource {
  type: 'resource';
  resource: {
    uri: string;       // e.g., ui://component/id
    mimeType: 'text/html' | 'text/uri-list' | 'application/vnd.mcp-ui.remote-dom'; // text/html for HTML content, text/uri-list for URL content, application/vnd.mcp-ui.remote-dom for remote-dom content (Javascript)
    text?: string;      // Inline HTML, external URL, or remote-dom script
    blob?: string;      // Base64-encoded HTML, URL, or remote-dom script
  };
}
```

* **`uri`**: Unique identifier for caching and routing
  * `ui://…` — UI resources (rendering method determined by mimeType)
* **`mimeType`**: `text/html` for HTML content (iframe srcDoc), `text/uri-list` for URL content (iframe src), `application/vnd.mcp-ui.remote-dom` for remote-dom content (Javascript)
  * **MCP-UI requires a single URL**: While `text/uri-list` format supports multiple URLs, MCP-UI uses only the first valid `http/s` URL and warns if additional URLs are found
* **`text` vs. `blob`**: Choose `text` for simple strings; use `blob` for larger or encoded content.

### Resource Renderer

The UI Resource is rendered in the `<UIResourceRenderer />` component. It automatically detects the resource type and renders the appropriate component.

It is available as a React component and as a Web Component.

**React Component**

It accepts the following props:
- **`resource`**: The resource object from an MCP Tool response. It must include `uri`, `mimeType`, and content (`text`, `blob`)
- **`onUIAction`**: Optional callback for handling UI actions from the resource:
  ```typescript
  { type: 'tool', payload: { toolName: string, params: Record<string, unknown> }, messageId?: string } |
  { type: 'intent', payload: { intent: string, params: Record<string, unknown> }, messageId?: string } |
  { type: 'prompt', payload: { prompt: string }, messageId?: string } |
  { type: 'notify', payload: { message: string }, messageId?: string } |
  { type: 'link', payload: { url: string }, messageId?: string }
  ```
  When actions include a `messageId`, the iframe automatically receives response messages for asynchronous handling.
- **`supportedContentTypes`**: Optional array to restrict which content types are allowed (`['rawHtml', 'externalUrl', 'remoteDom']`)
- **`htmlProps`**: Optional props for the internal `<HTMLResourceRenderer>`
  - **`style`**: Optional custom styles for the iframe
  - **`iframeProps`**: Optional props passed to the iframe element
- **`remoteDomProps`**: Optional props for the internal `<RemoteDOMResourceRenderer>`
  - **`library`**: Optional component library for Remote DOM resources (defaults to `basicComponentLibrary`)
  - **`remoteElements`**: remote element definitions for Remote DOM resources.

**Web Component**

The Web Component is available as `<ui-resource-renderer>`. It accepts the same props as the React component, but they must be passed as strings.

Example:
```html
<ui-resource-renderer
  resource='{ "mimeType": "text/html", "text": "<h2>Hello from the Web Component!</h2>" }'
></ui-resource-renderer>
```

The `onUIAction` prop can be handled by attaching an event listener to the component:
```javascript
const renderer = document.querySelector('ui-resource-renderer');
renderer.addEventListener('onUIAction', (event) => {
  console.log('Action:', event.detail);
});
```

The Web Component is available in the `@mcp-ui/client` package at `dist/ui-resource-renderer.wc.js`.

### Supported Resource Types

#### HTML (`text/html` and `text/uri-list`)

Rendered using the internal `<HTMLResourceRenderer />` component, which displays content inside an `<iframe>`. This is suitable for self-contained HTML or embedding external apps.

*   **`mimeType`**:
    *   `text/html`: Renders inline HTML content.
    *   `text/uri-list`: Renders an external URL. MCP-UI uses the first valid `http/s` URL.

#### Remote DOM (`application/vnd.mcp-ui.remote-dom`)

Rendered using the internal `<RemoteDOMResourceRenderer />` component, which utilizes Shopify's [`remote-dom`](https://github.com/Shopify/remote-dom). The server responds with a script that describes the UI and events. On the host, the script is securely rendered in a sandboxed iframe, and the UI changes are communicated to the host in JSON, where they're rendered using the host's component library. This is more flexible than iframes and allows for UIs that match the host's look-and-feel.

* **`mimeType`**: `application/vnd.mcp-ui.remote-dom+javascript; framework={react | webcomponents}`

### UI Action

UI snippets must be able to interact with the agent. In `mcp-ui`, this is done by hooking into events sent from the UI snippet and reacting to them in the host (see `onUIAction` prop). For example, an HTML may trigger a tool call when a button is clicked by sending an event which will be caught handled by the client.

## 🏗️ Installation

### TypeScript

```bash
# using npm
npm install @mcp-ui/server @mcp-ui/client

# or pnpm
pnpm add @mcp-ui/server @mcp-ui/client

# or yarn
yarn add @mcp-ui/server @mcp-ui/client
```

### Ruby

```bash
gem install mcp_ui_server
```

## 🚀 Getting Started

You can use [GitMCP](https://gitmcp.io/idosal/mcp-ui) to give your IDE access to `mcp-ui`'s latest documentation! 

### TypeScript

1. **Server-side**: Build your UI resources

   ```ts
   import { createUIResource } from '@mcp-ui/server';
   import {
    createRemoteComponent,
    createRemoteDocument,
    createRemoteText,
   } from '@remote-dom/core';

   // Inline HTML
   const htmlResource = createUIResource({
     uri: 'ui://greeting/1',
     content: { type: 'rawHtml', htmlString: '<p>Hello, MCP UI!</p>' },
     encoding: 'text',
   });

   // External URL
   const externalUrlResource = createUIResource({
     uri: 'ui://greeting/1',
     content: { type: 'externalUrl', iframeUrl: 'https://example.com' },
     encoding: 'text',
   });

   // remote-dom
   const remoteDomResource = createUIResource({
     uri: 'ui://remote-component/action-button',
     content: {
       type: 'remoteDom',
       script: `
        const button = document.createElement('ui-button');
        button.setAttribute('label', 'Click me for a tool call!');
        button.addEventListener('press', () => {
          window.parent.postMessage({ type: 'tool', payload: { toolName: 'uiInteraction', params: { action: 'button-click', from: 'remote-dom' } } }, '*');
        });
        root.appendChild(button);
        `,
       framework: 'react', // or 'webcomponents'
     },
     encoding: 'text',
   });
   ```

2. **Client-side**: Render in your MCP host

   ```tsx
   import React from 'react';
   import { UIResourceRenderer } from '@mcp-ui/client';

   function App({ mcpResource }) {
     if (
       mcpResource.type === 'resource' &&
       mcpResource.resource.uri?.startsWith('ui://')
     ) {
       return (
         <UIResourceRenderer
           resource={mcpResource.resource}
           onUIAction={(result) => {
             console.log('Action:', result);
           }}
         />
       );
     }
     return <p>Unsupported resource</p>;
   }
   ```

### Ruby

**Server-side**: Build your UI resources

   ```ruby
   require 'mcp_ui_server'

   # Inline HTML
   html_resource = McpUiServer.create_ui_resource(
     uri: 'ui://greeting/1',
     content: { type: :raw_html, htmlString: '<p>Hello, from Ruby!</p>' },
     encoding: :text
   )

   # External URL
   external_url_resource = McpUiServer.create_ui_resource(
     uri: 'ui://greeting/2',
     content: { type: :external_url, iframeUrl: 'https://example.com' },
     encoding: :text
   )

   # remote-dom
   remote_dom_resource = McpUiServer.create_ui_resource(
     uri: 'ui://remote-component/action-button',
     content: {
       type: :remote_dom,
       script: "
        const button = document.createElement('ui-button');
        button.setAttribute('label', 'Click me from Ruby!');
        button.addEventListener('press', () => {
          window.parent.postMessage({ type: 'tool', payload: { toolName: 'uiInteraction', params: { action: 'button-click', from: 'ruby-remote-dom' } } }, '*');
        });
        root.appendChild(button);
        ",
       framework: :react,
     },
     encoding: :text
   )
   ```

## 🚶 Walkthrough

For a detailed, simple, step-by-step guide on how to integrate `mcp-ui` into your own server, check out the full server walkthroughs on the [mcp-ui documentation site](https://mcpui.dev):

- **[TypeScript Server Walkthrough](https://mcpui.dev/guide/server/typescript/walkthrough)**
- **[Ruby Server Walkthrough](https://mcpui.dev/guide/server/ruby/walkthrough)**

These guides will show you how to add a `mcp-ui` endpoint to an existing server, create tools that return UI resources, and test your setup with the `ui-inspector`!

## 🌍 Examples

**Client Examples**
* [ui-inspector](https://github.com/idosal/ui-inspector) - inspect local `mcp-ui`-enabled servers. 
* [MCP-UI Chat](https://github.com/idosal/scira-mcp-ui-chat) - interactive chat built with the `mcp-ui` client. Check out the [hosted version](https://scira-mcp-chat-git-main-idosals-projects.vercel.app/)!
* MCP-UI RemoteDOM Playground (`examples/remote-dom-demo`) - local demo app to test RemoteDOM resources (intended for hosts)

**Server Examples**
* **TypeScript**: A [full-featured server](examples/server) that is deployed to a hosted environment for easy testing.
  * **[`typescript-server-demo`](./examples/typescript-server-demo)**: A simple Typescript server that demonstrates how to generate UI resources.
  * **server**: A [full-featured Typescript server](examples/server) that is deployed to a hosted Cloudflare environment for easy testing.
    * **HTTP Streaming**: `https://remote-mcp-server-authless.idosalomon.workers.dev/mcp`
    * **SSE**: `https://remote-mcp-server-authless.idosalomon.workers.dev/sse`
* **Ruby**: A barebones [demo server](/examples/ruby-server-demo) that shows how to use `mcp_ui_server` and `mcp` gems together.

Drop those URLs into any MCP-compatible host to see `mcp-ui` in action. For a supported local inspector, see the [ui-inspector](https://github.com/idosal/ui-inspector).



## 🔒 Security
Host and user security is one of `mcp-ui`'s primary concerns. In all content types, the remote code is executed in a sandboxed iframe.


## 🛣️ Roadmap

- [X] Add online playground
- [X] Expand UI Action API (beyond tool calls)
- [X] Support Web Components
- [X] Support Remote-DOM
- [ ] Add component libraries (in progress)
- [ ] Add SDKs for additional programming languages (in progress; Ruby available)
- [ ] Support additional frontend frameworks
- [ ] Add declarative UI content type
- [ ] Support generative UI?
      
## 🤝 Contributing

Contributions, ideas, and bug reports are welcome! See the [contribution guidelines](https://github.com/idosal/mcp-ui/blob/main/.github/CONTRIBUTING.md) to get started.


## 📄 License

Apache License 2.0 © [The MCP-UI Authors](LICENSE)

## Disclaimer

This project is provided "as is", without warranty of any kind. The `mcp-ui` authors and contributors shall not be held liable for any damages, losses, or issues arising from the use of this software. Use at your own risk.
