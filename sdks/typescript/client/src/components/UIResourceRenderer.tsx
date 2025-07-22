import type { Resource } from '@modelcontextprotocol/sdk/types.js';
import { ResourceContentType, UIActionResult } from '../types';
import { HTMLResourceRenderer, HTMLResourceRendererProps } from './HTMLResourceRenderer';
import { RemoteDOMResourceProps, RemoteDOMResourceRenderer } from './RemoteDOMResourceRenderer';
import { basicComponentLibrary } from '../remote-dom/component-libraries/basic';

type UIResourceRendererProps = {
  resource: Partial<Resource>;
  onUIAction?: (result: UIActionResult) => Promise<unknown>;
  supportedContentTypes?: ResourceContentType[];
  htmlProps?: Omit<HTMLResourceRendererProps, 'resource' | 'onUIAction'>;
  remoteDomProps?: Omit<RemoteDOMResourceProps, 'resource' | 'onUIAction'>;
};

function getContentType(resource: Partial<Resource>): ResourceContentType | undefined {
  if (resource.contentType) {
    return resource.contentType as ResourceContentType;
  }

  if (resource.mimeType === 'text/html') {
    return 'rawHtml';
  }
  if (resource.mimeType === 'text/uri-list') {
    return 'externalUrl';
  }
  if (resource.mimeType?.startsWith('application/vnd.mcp-ui.remote-dom')) {
    return 'remoteDom';
  }
}

export const UIResourceRenderer = (props: UIResourceRendererProps) => {
  const { resource, onUIAction, supportedContentTypes, htmlProps, remoteDomProps } = props;
  const contentType = getContentType(resource);

  if (supportedContentTypes && contentType && !supportedContentTypes.includes(contentType)) {
    return <p className="text-red-500">Unsupported content type: {contentType}.</p>;
  }

  switch (contentType) {
    case 'rawHtml': {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { proxy, ...otherHtmlProps } = htmlProps || {};
      return (
        <HTMLResourceRenderer resource={resource} onUIAction={onUIAction} {...otherHtmlProps} />
      );
    }
    case 'externalUrl': {
      return <HTMLResourceRenderer resource={resource} onUIAction={onUIAction} {...htmlProps} />;
    }
    case 'remoteDom':
      return (
        <RemoteDOMResourceRenderer
          resource={resource}
          onUIAction={onUIAction}
          library={remoteDomProps?.library || basicComponentLibrary}
          {...remoteDomProps}
        />
      );
    default:
      return <p className="text-red-500">Unsupported resource type.</p>;
  }
};

UIResourceRenderer.displayName = 'UIResourceRenderer';
