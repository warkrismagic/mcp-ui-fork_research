import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import { Resource } from '@modelcontextprotocol/sdk/types.js';
import { UIResourceRenderer } from '../UIResourceRenderer';

describe('UIResourceRenderer', () => {
  const testResource: Partial<Resource> = {
    mimeType: 'text/html',
    text: '<html><body><h1>Test Content</h1><script>console.log("iframe script loaded for onUIAction tests")</script></body></html>',
    uri: 'ui://test-resource',
  };
  it('should pass ref to HTMLResourceRenderer', () => {
    const ref = React.createRef<HTMLIFrameElement>();
    render(<UIResourceRenderer resource={testResource} htmlProps={{ iframeProps: { ref } }} />);
    expect(ref.current).toBeInTheDocument();
  });
});
