import { Blob as NodeBlob, File as NodeFile } from 'node:buffer';
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { mswServer } from './fake-server.js';

beforeAll(() => mswServer.listen({ onUnhandledFrame: 'error' }));
afterEach(() => {
  cleanup();
  mswServer.resetHandlers();
});
afterAll(() => mswServer.close());

// jsdom lacks these; Radix uses them.
if (typeof window.matchMedia === 'undefined') {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}
window.scrollTo = () => {};
Element.prototype.scrollIntoView ??= function () {};
Element.prototype.setPointerCapture ??= function () {};
Element.prototype.releasePointerCapture ??= function () {};
Element.prototype.hasPointerCapture ??= function () {
  return false;
};

// `fetch` here is Node's, and jsdom's FormData, Blob and File do not survive the trip into it
// as multipart (the file name is lost and the body length is wrong). A dictation is sent as
// multipart, so the three globals are Node's own in tests. They are defined on the global
// object only: jsdom's window keeps its classes, so Vitest's jsdom shim leaves ours alone.
// Node exports no FormData; an empty parsed body is the way to reach its class.
const nodeFormData = await new Response(new URLSearchParams()).formData();
const nodeBodyClasses = { FormData: nodeFormData.constructor, Blob: NodeBlob, File: NodeFile };
for (const [name, value] of Object.entries(nodeBodyClasses)) {
  Object.defineProperty(globalThis, name, { value, configurable: true, writable: true });
}
