import type Redis from 'ioredis';
import type { ClusterMessage, ClusterResponse, Offset, ServerId } from 'socket.io-adapter';
import type { ClusterAdapterOptions } from 'socket.io-adapter/dist/cluster-adapter';
import { decode, encode } from '@msgpack/msgpack';
import { hasBinary } from '@socket.io/redis-streams-adapter/dist/util';
import { ClusterAdapterWithHeartbeat, MessageType } from 'socket.io-adapter';

function mapResult(result: any[]) {
  const id = result[0];
  const inlineValues = result[1];
  const message: any = {};
  for (let i = 0; i < inlineValues.length; i += 2) {
    message[inlineValues[i]] = inlineValues[i + 1];
  }
  return {
    id,
    message,
  };
}

export function redisAdapter(redis: Redis, streamName: string = 'osucad') {
  const namespaceToAdapters = new Map<string, RedisStreamsAdapter>();

  let offset = '$';
  let polling = false;
  let shouldClose = false;

  async function poll() {
    try {
      const response = await redis.xread('BLOCK', 10, 'STREAMS', streamName, offset)
        .then((results) => {
          if (results === null)
            return null;
          return [
            {
              messages: results[0][1].map(mapResult),
            },
          ];
        });

      if (response) {
        for (const entry of response[0].messages) {
          const message = entry.message;

          if (message.nsp) {
            namespaceToAdapters
              .get(message.nsp)
              ?.onRawMessage(message, entry.id);
          }

          offset = entry.id;
        }
      }
    }
    catch (e: any) {
      console.debug('something went wrong while consuming the stream: %s', e.message);
    }

    if (namespaceToAdapters.size > 0 && !shouldClose) {
      poll();
    }
    else {
      polling = false;
    }
  }

  return function (nsp: any) {
    const adapter = new RedisStreamsAdapter(redis, streamName, nsp, {});
    namespaceToAdapters.set(nsp.name, adapter);

    if (!polling) {
      polling = true;
      shouldClose = false;
      poll();
    }

    const defaultClose = adapter.close;

    adapter.close = () => {
      namespaceToAdapters.delete(nsp.name);

      if (namespaceToAdapters.size === 0) {
        shouldClose = true;
      }

      defaultClose.call(adapter);
    };

    return adapter;
  };
}

class RedisStreamsAdapter extends ClusterAdapterWithHeartbeat {
  constructor(
    readonly redis: Redis,
    readonly streamName: string,
    nsp: any,
    opts: ClusterAdapterOptions,
  ) {
    super(nsp, opts);
  }

  protected doPublish(message: ClusterMessage): Promise<Offset> {
    const args = [this.streamName, 'MAXLEN', '~', 10_000, '*'] as any;
    const payload = RedisStreamsAdapter.encode(message);

    for (const key in payload)
      args.push(key, payload[key as keyof typeof payload]);

    return this.redis.xadd(args) as Promise<string>;
  }

  protected async doPublishResponse(requesterUid: ServerId, response: ClusterResponse): Promise<void> {
    await this.doPublish(response as unknown as ClusterMessage);
  }

  static encode(message: ClusterMessage): RawClusterMessage {
    const rawMessage: RawClusterMessage = {
      uid: message.uid,
      nsp: message.nsp,
      type: message.type.toString(),
    };

    if ('data' in message) {
      const mayContainBinary = [
        MessageType.BROADCAST,
        MessageType.FETCH_SOCKETS_RESPONSE,
        MessageType.SERVER_SIDE_EMIT,
        MessageType.SERVER_SIDE_EMIT_RESPONSE,
        MessageType.BROADCAST_ACK,
      ].includes(message.type);

      if (mayContainBinary && hasBinary(message.data)) {
        // eslint-disable-next-line node/prefer-global/buffer
        rawMessage.data = Buffer.from(encode(message.data)).toString('base64');
      }
      else {
        rawMessage.data = JSON.stringify(message.data);
      }
    }

    return rawMessage;
  }

  public onRawMessage(rawMessage: RawClusterMessage, offset: string) {
    let message;
    try {
      message = RedisStreamsAdapter.decode(rawMessage);
    }
    catch (e: any) {
      return console.debug('invalid format: %s', e.message);
    }

    this.onMessage(message, offset);
  }

  static decode(rawMessage: RawClusterMessage): ClusterMessage {
    const message: ClusterMessage = {
      uid: rawMessage.uid,
      nsp: rawMessage.nsp,
      type: Number.parseInt(rawMessage.type, 10),
    };

    if (rawMessage.data) {
      if (rawMessage.data.startsWith('{')) {
        (message as any).data = JSON.parse(rawMessage.data);
      }
      else {
        // eslint-disable-next-line node/prefer-global/buffer
        (message as any).data = decode(Buffer.from(rawMessage.data, 'base64')) as Record<string, unknown>;
      }
    }

    return message;
  }
}

interface RawClusterMessage {
  uid: string;
  nsp: string;
  type: string;
  data?: string;
}
