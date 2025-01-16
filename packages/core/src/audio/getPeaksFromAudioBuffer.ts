export function getPeaksFromAudioBuffer(
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
          break;

        if (Math.abs(channelData[j]) > amplitude)
          amplitude = channelData[j];
      }

      amplitudes.push(amplitude);
    }

    channelAmplitudes.push(amplitudes);
  }

  return channelAmplitudes;
}
