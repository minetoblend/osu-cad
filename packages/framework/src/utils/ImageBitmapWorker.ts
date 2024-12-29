interface MessageData {
  data: any[];
  uuid: number;
  id: string;
}

interface LoadImageBitmapOptions {
  resize?: {
    width: number;
    height: number;
    mode: 'fit' | 'fill' | 'stretch';
  };
}

let canvas: OffscreenCanvas;

async function getImageData(src: string | ArrayBuffer) {
  if (src instanceof ArrayBuffer)
    return new Blob([src]);

  const response = await fetch(src, {
    cache: 'no-cache',
  });

  if (!response.ok) {
    throw new Error(`[WorkerManager.loadImageBitmap] Failed to fetch ${src}: ${response.status} ${response.statusText}`);
  }

  return await response.blob();
}

async function loadImageBitmap(src: string | ArrayBuffer, alphaMode?: string, options?: LoadImageBitmapOptions) {
  const imageBlob = await getImageData(src)

  const imageBitmap = alphaMode === 'premultiplied-alpha'
    ? createImageBitmap(imageBlob, { premultiplyAlpha: 'none' })
    : createImageBitmap(imageBlob);

  if (options?.resize) {
    const resizedImageBitmap = await resizeImageBitmap(await imageBitmap, options.resize.width, options.resize.height, options.resize.mode);

    return resizedImageBitmap;
  }

  return imageBitmap;
}

async function resizeImageBitmap(imageBitmap: ImageBitmap, width: number, height: number, scaleMode: 'fit' | 'fill' | 'stretch') {
  const ctx = canvas.getContext('2d');
  if (!ctx)
    throw new Error('Canvas context is not available');

  ctx.imageSmoothingEnabled = false;

  canvas.width = width;
  canvas.height = height;

  if (scaleMode === 'fit') {
    const ratio = Math.max(imageBitmap.width / width, imageBitmap.height / height);

    if (ratio <= 1) {
      return imageBitmap;
    }

    const w = imageBitmap.width / ratio;
    const h = imageBitmap.height / ratio;

    const x = (width - w) / 2;
    const y = (height - h) / 2;

    ctx.drawImage(imageBitmap, x, y, w, h);
  } else if (scaleMode === 'fill') {
    const ratio = Math.min(imageBitmap.width / width, imageBitmap.height / height);

    if (ratio <= 1) {
      return imageBitmap;
    }

    const w = imageBitmap.width / ratio;
    const h = imageBitmap.height / ratio;

    const x = (width - w) / 2;
    const y = (height - h) / 2;

    ctx.drawImage(imageBitmap, x, y, w, h);
  } else {
    ctx.drawImage(imageBitmap, 0, 0, width, height);
  }

  return canvas.transferToImageBitmap();
}

globalThis.onmessage = async (event: MessageEvent<MessageData>) => {
  if (!canvas) {
    canvas = event.data.data[1];
    return;
  }

  try {
    const imageBitmap = await loadImageBitmap(event.data.data[0], event.data.data[1], event.data.data[2]);

    globalThis.postMessage({
      data: imageBitmap,
      uuid: event.data.uuid,
      id: event.data.id,
      // @ts-expect-error - we are in a web worker and typescript is not smart enough to figure that out
    }, [imageBitmap]);
  } catch (e) {
    globalThis.postMessage({
      error: e,
      uuid: event.data.uuid,
      id: event.data.id,
    });
  }
};
