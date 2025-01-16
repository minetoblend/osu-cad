export function getAmplitudesFromAudioBuffer(
  buffer: AudioBuffer,
  sampleDurationMs: number,
): number[][] {
  const channelAmplitudes: number[][] = [];

  const samplesPerStep = Math.ceil(buffer.duration * sampleDurationMs * 1000);

  for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
    const channelData = buffer.getChannelData(channel);

    const amplitudes: number[] = [];

    for (let i = 0; i < channelData.length; i += samplesPerStep) {
      let amplitude = 0;

      for (let j = i; j < i + samplesPerStep; j++) {
        if (j > channelData.length)
          j++;

        const value = Math.abs(channelData[j]);
        if (value > amplitude)
          amplitude = value;
      }

      amplitudes.push(amplitude);
    }

    channelAmplitudes.push(amplitudes);
  }

  return channelAmplitudes;
}

export function mergeAmplitudes(channelAmplitudes: number[][]) {
  const amplitudes: number[] = [];

  for (let i = 0; i < channelAmplitudes[0].length; i++) {
    let value = 0;

    for (let j = 0; j < channelAmplitudes.length; j++)
      value += channelAmplitudes[j][i];

    amplitudes.push(value / channelAmplitudes.length);
  }

  return amplitudes;
}
