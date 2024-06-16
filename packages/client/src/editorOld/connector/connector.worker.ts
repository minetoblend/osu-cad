import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

self.addEventListener('message', (event) => {
  if (!socket) {
    socket = io(event.data.url as string, event.data.options as any);

    socket.onAny((message, ...payload) => {
      self.postMessage({ type: message, payload });
    });
    socket.on('connect', () => {
      self.postMessage({ type: 'connect' });
    });
    socket.on('disconnect', () => {
      self.postMessage({ type: 'disconnect' });
    });
  } else {
    socket.send(event.data.type, ...event.data.payload);
  }
});
