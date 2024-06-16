import { decompressMessage } from '@osucad/common';

self.onmessage = (e) => {
  const [message, data] = e.data;
  const decompressed = decompressMessage(data);
  self.postMessage([message, decompressed]);
};
