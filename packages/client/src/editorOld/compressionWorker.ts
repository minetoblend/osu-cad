import { compressMessage } from '@osucad/common';

self.onmessage = (e) => {
  const [message, data] = e.data;
  const compressed = compressMessage(data);
  self.postMessage([message, compressed]);
};
