import {texturePacker, texturePackerCompress} from "@assetpack/core/texture-packer";
import {compress} from "@assetpack/core/image";
import {msdfFont} from "@assetpack/core/webfont";

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
    msdfFont({
      font: {
        texturePadding: 5,
        outputType: "json",
        fieldType: 'psdf'
      }
    }),
    texturePacker({
      texturePacker: {
        padding: 4,
        nameStyle: "relative",
        removeFileExtension: true,
      },
      resolutionOptions: {
        template: "@%%x",
        resolutions: {default: 1},
        fixedResolution: "default",
        maximumTextureSize: 4096,
      },
    }),
    compress(compressionOptions),
    texturePackerCompress(compressionOptions),
  ],
};
