import axios from "axios";
import {IUnisonContainer} from "@osucad/unison-client";
import {Sound} from "@pixi/sound";

export async function loadAudio(container: IUnisonContainer) {
  const response = await axios.get(
    `https://api.osucad.com/editor/${container.id}/audio`,
    {
      withCredentials: true,
      responseType: "arraybuffer",
    }
  );
  return await new Promise<{ songAudio: Sound }>((resolve, reject) => {
    const sound = Sound.from({
      preload: true,
      source: response.data,
      loaded: (err) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            songAudio: sound,
          });
        }
      },
    });
  });
}
