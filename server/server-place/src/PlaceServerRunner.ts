import type { Provider } from 'nconf';
import type { Server } from 'node:http';
import type { BeatmapService } from 'server/server-place/src/services/BeatmapService';
import { Deferred, type IRunner } from '@osucad-server/common';
import * as app from './app';

export class PlaceServerRunner implements IRunner {
  constructor(
    private readonly config: Provider,
    private readonly port: number | string,
    private readonly beatmapService: BeatmapService,
  ) {
  }

  private server!: Server;

  private runningDeferred?: Deferred<void>;

  async start() {
    this.runningDeferred = new Deferred<void>();

    const server = app.create(
      this.config,
    );
    server.set('port', this.port);

    this.server = server.listen(this.port);

    this.server.on('listening', () => this.onListening());
    this.server.on('error', error => this.onError(error));

    return this.runningDeferred.promise;
  }

  stop(reason?: string): Promise<void> {
    if (this.server) {
      this.server.close((err) => {
        if (err) {
          console.error('Failed to close server', err);
          this.runningDeferred?.reject(err);
        }
        else {
          this.runningDeferred?.resolve();
        }
      });
    }
    else {
      this.runningDeferred?.resolve();
    }

    return this.runningDeferred?.promise ?? Promise.resolve();
  }

  private onError(error: any) {
    if (error.syscall !== 'listen') {
      throw error;
    }

    const bind = typeof this.port === 'string' ? `Pipe ${this.port}` : `Port ${this.port}`;

    // Handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        this.runningDeferred?.reject(`${bind} requires elevated privileges`);
        break;
      case 'EADDRINUSE':
        this.runningDeferred?.reject(`${bind} is already in use`);
        break;
      default:
        throw error;
    }
  }

  private onListening() {
    const addr = this.server.address();
    const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr?.port}`;
    console.log(`Listening on ${bind}`);
  }
}
