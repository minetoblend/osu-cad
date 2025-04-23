import {texturePacker, texturePackerCompress} from "@assetpack/core/texture-packer";
import {compress} from "@assetpack/core/image";
import {msdfFont} from "@assetpack/core/webfont";
import {ffmpeg} from "@assetpack/core/ffmpeg";

const compressionOptions = {
  jpg: false,
  png: false,
  webp: {quality: 80, alphaQuality: 80,},
  avif: false,
  bc7: false,
  astc: false,
  basis: false,
};

export default {
  entry: './resources-raw',
  output: './src/assets',
  cache: false,
  pipes: [
    ffmpeg({
      inputs: ['.mp3', '.ogg', '.wav'],
      outputs: [
        {
          formats: ['.wav'],
          recompress: false,
          options: {}
        }
      ]
    }),
    msdfFont({
      font: {
        texturePadding: 5,
        outputType: "json",
      }
    }),
    texturePacker({
      texturePacker: {
        padding: 4,
        nameStyle: "relative",
        removeFileExtension: true,
        allowRotation: false,
      },
      resolutionOptions: {
        template: "@%%x",
        resolutions: { default: 1 },
        fixedResolution: "default",
        maximumTextureSize: 4096,
      },
    }),
    compress(compressionOptions),
    texturePackerCompress(compressionOptions),
  ],
};
