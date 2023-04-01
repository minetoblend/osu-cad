import axios from "axios";
import {IUnisonTokenProvider} from "@osucad/unison-client";
import {authenticate} from "@/composables/authenticate";

export const getToken = async (id: string): Promise<string> => {
  try {
    const response = await axios.get(
      "https://api.osucad.com/editor/token/" + id,
      {
        withCredentials: true,
      }
    );
    return response.data.token;
  } catch (e) {
    throw new Error("Failed to get token", { cause: e });
  }
};

export const tokenProvider: IUnisonTokenProvider = {
  getToken: (id) =>
    getToken(id).catch((e) => {
      authenticate();
      throw e;
    }),
};
