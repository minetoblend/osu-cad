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
      encoder.encodeSerializableElement(descriptor, 0, Int32Serializer, value.osuWebId)
      encoder.encodeSerializableElement(descriptor, 1, StringSerializer, value.audioFileName)
      encoder.encodeSerializableElement(descriptor, 2, Int32Serializer, value.audioLeadIn)
      encoder.encodeSerializableElement(descriptor, 3, StringSerializer, value.audioHash)
      encoder.encodeSerializableElement(descriptor, 4, Int32Serializer, value.previewTime)
      encoder.encodeSerializableElement(descriptor, 5, Int32Serializer, value.countdown)
      encoder.encodeSerializableElement(descriptor, 6, StringSerializer, value.sampleSet)
      encoder.encodeSerializableElement(descriptor, 7, Float32Serializer, value.stackLeniency)
      encoder.encodeSerializableElement(descriptor, 8, Uint8Serializer, value.mode)
      encoder.encodeSerializableElement(descriptor, 9, BooleanSerializer, value.letterboxInBreaks)
      encoder.encodeSerializableElement(descriptor, 10, BooleanSerializer, value.useSkinSprites)
      encoder.encodeSerializableElement(descriptor, 11, BooleanSerializer, value.alwaysShowPlayfield)
      encoder.encodeSerializableElement(descriptor, 12, StringSerializer, value.overlayPosition)
      encoder.encodeSerializableElement(descriptor, 13, StringSerializer, value.skinPreference)
      encoder.encodeSerializableElement(descriptor, 14, BooleanSerializer, value.epilepsyWarning)
      encoder.encodeSerializableElement(descriptor, 15, Int32Serializer, value.countdownOffset)
      encoder.encodeSerializableElement(descriptor, 16, BooleanSerializer, value.specialStyle)
      encoder.encodeSerializableElement(descriptor, 17, BooleanSerializer, value.widescreenStoryboard)
      encoder.encodeSerializableElement(descriptor, 18, BooleanSerializer, value.samplesMatchPlaybackRate)
      encoder.encodeSerializableElement(descriptor, 19, StringSerializer, value.backgroundFilename)
    })
  },
  deserialize(decoder: Decoder): BeatmapSettings {
    const descriptor = this.descriptor
    const difficulty = new BeatmapSettings()
    const nested = decoder.beginStructure(descriptor)

    difficulty.osuWebId = nested.decodeSerializableElement(descriptor, 0, Int32Serializer)
    difficulty.audioFileName = nested.decodeSerializableElement(descriptor, 1, StringSerializer)
    difficulty.audioLeadIn = nested.decodeSerializableElement(descriptor, 2, Int32Serializer)
    difficulty.audioHash = nested.decodeSerializableElement(descriptor, 3, StringSerializer)
    difficulty.previewTime = nested.decodeSerializableElement(descriptor, 4, Int32Serializer)
    difficulty.countdown = nested.decodeSerializableElement(descriptor, 5, Int32Serializer)
    difficulty.sampleSet = nested.decodeSerializableElement(descriptor, 6, StringSerializer)
    difficulty.stackLeniency = nested.decodeSerializableElement(descriptor, 7, Float32Serializer)
    difficulty.mode = nested.decodeSerializableElement(descriptor, 8, Uint8Serializer)
    difficulty.letterboxInBreaks = nested.decodeSerializableElement(descriptor, 9, BooleanSerializer)
    difficulty.useSkinSprites = nested.decodeSerializableElement(descriptor, 10, BooleanSerializer)
    difficulty.alwaysShowPlayfield = nested.decodeSerializableElement(descriptor, 11, BooleanSerializer)
    difficulty.overlayPosition = nested.decodeSerializableElement(descriptor, 12, StringSerializer)
    difficulty.skinPreference = nested.decodeSerializableElement(descriptor, 13, StringSerializer)
    difficulty.epilepsyWarning = nested.decodeSerializableElement(descriptor, 14, BooleanSerializer)
    difficulty.countdownOffset = nested.decodeSerializableElement(descriptor, 15, Int32Serializer)
    difficulty.specialStyle = nested.decodeSerializableElement(descriptor, 16, BooleanSerializer)
    difficulty.widescreenStoryboard = nested.decodeSerializableElement(descriptor, 17, BooleanSerializer)
    difficulty.samplesMatchPlaybackRate = nested.decodeSerializableElement(descriptor, 18, BooleanSerializer)
    difficulty.backgroundFilename = nested.decodeSerializableElement(descriptor, 19, new NullableSerializer(StringSerializer))

    nested.endStructure(descriptor)
  }
}
