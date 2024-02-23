import * as uuid from 'uuid';

export type EncodedUuid = number[];

export function encodeUuid(uuidString: string): number[] {
  // parse accountId into Uint8Array[16] variable
  const parsedUuid = uuid.parse(uuidString);
  // convert to integer - see answers to https://stackoverflow.com/q/39346517/2860309

  return Array.from(
    new Int32Array(
      parsedUuid.buffer,
      0,
      parsedUuid.byteLength / Int32Array.BYTES_PER_ELEMENT,
    ),
  );
}

export function decodeUuid(values: number[]): string {
  // convert to Uint8Array[16] - see answers to https://stackoverflow.com/q/39346517/2860309
  const uuidBuffer = new ArrayBuffer(16);
  const uuidBytes = new Uint8Array(uuidBuffer);
  uuidBytes.set(values);
  // convert to string
  return uuid.stringify(uuidBytes);
}
