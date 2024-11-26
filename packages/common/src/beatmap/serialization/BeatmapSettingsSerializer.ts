import {
  BooleanSerializer,
  buildClassSerialDescriptor,
  Decoder,
  Encoder,
  Float32Serializer,
  Int32Serializer, NullableSerializer,
  Serializer, StringSerializer, Uint8Serializer
} from "@osucad/serialization";
import { Beatmap, BeatmapDifficultyInfo, BeatmapSettings } from "@osucad/common";

export const BeatmapSettingsSerializer: Serializer<BeatmapSettings> = {
  descriptor: buildClassSerialDescriptor('BeatmapDifficultyInfo', ({element}) => {
    element('osuWebId', Int32Serializer.descriptor);
    element('audioFileName', StringSerializer.descriptor);
    element('audioLeadIn', Int32Serializer.descriptor);
    element('audioHash', StringSerializer.descriptor);
    element('previewTime', Int32Serializer.descriptor);
    element('countdown', Int32Serializer.descriptor);
    element('sampleSet', StringSerializer.descriptor);
    element('stackLeniency', Float32Serializer.descriptor);
    element('mode', Uint8Serializer.descriptor);
    element('letterboxInBreaks', BooleanSerializer.descriptor);
    element('useSkinSprites', BooleanSerializer.descriptor);
    element('alwaysShowPlayfield', BooleanSerializer.descriptor);
    element('overlayPosition', StringSerializer.descriptor);
    element('skinPreference', StringSerializer.descriptor);
    element('epilepsyWarning', BooleanSerializer.descriptor);
    element('countdownOffset', Int32Serializer.descriptor);
    element('specialStyle', BooleanSerializer.descriptor);
    element('widescreenStoryboard', BooleanSerializer.descriptor);
    element('samplesMatchPlaybackRate', BooleanSerializer.descriptor);
    element('backgroundFilename', new NullableSerializer(StringSerializer).descriptor);
  }),
  serialize(encoder: Encoder, value: BeatmapSettings) {
    const descriptor = this.descriptor
    encoder.encodeStructure(descriptor, (encoder) => {
      encoder.encodeInt32Element(descriptor, 0, value.osuWebId)
      encoder.encodeStringElement(descriptor, 1, value.audioFileName)
      encoder.encodeInt32Element(descriptor, 2, value.audioLeadIn)
      encoder.encodeStringElement(descriptor, 3, value.audioHash)
      encoder.encodeInt32Element(descriptor, 4, value.previewTime)
      encoder.encodeInt32Element(descriptor, 5, value.countdown)
      encoder.encodeStringElement(descriptor, 6, value.sampleSet)
      encoder.encodeFloat32Element(descriptor, 7, value.stackLeniency)
      encoder.encodeUint8Element(descriptor, 8, value.mode)
      encoder.encodeBooleanElement(descriptor, 9, value.letterboxInBreaks)
      encoder.encodeBooleanElement(descriptor, 10, value.useSkinSprites)
      encoder.encodeBooleanElement(descriptor, 11, value.alwaysShowPlayfield)
      encoder.encodeStringElement(descriptor, 12, value.overlayPosition)
      encoder.encodeStringElement(descriptor, 13, value.skinPreference)
      encoder.encodeBooleanElement(descriptor, 14, value.epilepsyWarning)
      encoder.encodeInt32Element(descriptor, 15, value.countdownOffset)
      encoder.encodeBooleanElement(descriptor, 16, value.specialStyle)
      encoder.encodeBooleanElement(descriptor, 17, value.widescreenStoryboard)
      encoder.encodeBooleanElement(descriptor, 18, value.samplesMatchPlaybackRate)
      encoder.encodeNullableSerializableElement(descriptor, 19, StringSerializer, value.backgroundFilename)
    })
  },
  deserialize(decoder: Decoder): BeatmapSettings {
    const descriptor = this.descriptor
    const difficulty = new BeatmapSettings()
    const nested = decoder.beginStructure(descriptor)

    difficulty.osuWebId = nested.decodeInt32Element(descriptor, 0)
    difficulty.audioFileName = nested.decodeStringElement(descriptor, 1)
    difficulty.audioLeadIn = nested.decodeInt32Element(descriptor, 2)
    difficulty.audioHash = nested.decodeStringElement(descriptor, 3)
    difficulty.previewTime = nested.decodeInt32Element(descriptor, 4)
    difficulty.countdown = nested.decodeInt32Element(descriptor, 5)
    difficulty.sampleSet = nested.decodeStringElement(descriptor, 6)
    difficulty.stackLeniency = nested.decodeFloat32Element(descriptor, 7)
    difficulty.mode = nested.decodeUint8Element(descriptor, 8)
    difficulty.letterboxInBreaks = nested.decodeBooleanElement(descriptor, 9)
    difficulty.useSkinSprites = nested.decodeBooleanElement(descriptor, 10)
    difficulty.alwaysShowPlayfield = nested.decodeBooleanElement(descriptor, 11)
    difficulty.overlayPosition = nested.decodeStringElement(descriptor, 12)
    difficulty.skinPreference = nested.decodeStringElement(descriptor, 13)
    difficulty.epilepsyWarning = nested.decodeBooleanElement(descriptor, 14)
    difficulty.countdownOffset = nested.decodeInt32Element(descriptor, 15)
    difficulty.specialStyle = nested.decodeBooleanElement(descriptor, 16)
    difficulty.widescreenStoryboard = nested.decodeBooleanElement(descriptor, 17)
    difficulty.samplesMatchPlaybackRate = nested.decodeBooleanElement(descriptor, 18)
    difficulty.backgroundFilename = nested.decodeNullableSerializableElement(descriptor, 19, StringSerializer)

    nested.endStructure(descriptor)
  }
}
