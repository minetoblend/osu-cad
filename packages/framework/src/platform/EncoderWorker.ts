import { Muxer, StreamTarget } from "mp4-muxer";

let encoder: VideoEncoder;
let muxer: Muxer<StreamTarget>;

let decodedCallback: (() => void) | undefined;

let frameCount = 0;


globalThis.onmessage = async evt =>
{
  const inputStream = evt.data.inputStream as ReadableStream<VideoFrame | null>;
  const outputStream = evt.data.outputStream as WritableStream<Uint8Array>;
  const { width, height, framerate } = evt.data;

  const encodeStream = new TransformStream<VideoFrame | null, [EncodedVideoChunk, EncodedVideoChunkMetadata | undefined]>({
    start(controller)
    {
      encoder = new VideoEncoder({
        output: (chunk, metadata ) =>
        {
          if (decodedCallback)
          {
            decodedCallback();
            decodedCallback = undefined;
          }

          controller.enqueue([chunk, metadata]);
        },
        error: console.error,
      });

      encoder.configure({
        codec: "avc1.640034",
        width,
        height,
        framerate: framerate,
        hardwareAcceleration: "prefer-hardware",
        avc: {
          format:"annexb",
        },
      });
    },
    transform: async (frame)=>
    {
      if (frame === null)
      {
        await encoder.flush();
        encoder.close();
        return;
      }

      if (encoder.state === "closed")
      {
        frame.close();
        return;
      }

      return new Promise((resolve) =>
      {
        encoder.encode(frame, { keyFrame: frameCount++ % 150 === 0 });
        frame.close();
        encoder.flush().then(resolve);
      });
    },
    flush: async () =>
    {
      if (encoder.state !== "closed")
        await encoder.flush();
    },
  });

  const muxStream = new TransformStream<[EncodedVideoChunk, EncodedVideoChunkMetadata | undefined], Uint8Array>({
    start(controller)
    {
      muxer = new Muxer({
        target: new StreamTarget({
          chunked: true,
          chunkSize: 500_000,
          onData: (data, position) =>
          {
            controller.enqueue(data);
            console.log(`enqueuing ${data.length} bytes of data, position=${position}`);
          },
        }),
        video: {
          codec: "avc",
          width,
          height,
          frameRate: framerate,
        },
        fastStart: "in-memory",
      });
    },
    transform([chunk, metadata])
    {
      muxer.addVideoChunk(chunk, metadata);

    },
    flush()
    {
      if (encoder.state === "closed")
      {
        console.log("finalizing");
        muxer.finalize();
      }
    },
  });

  await inputStream
    .pipeThrough(encodeStream)
    .pipeThrough(muxStream)
    .pipeTo(outputStream);

  console.log("done");
};
