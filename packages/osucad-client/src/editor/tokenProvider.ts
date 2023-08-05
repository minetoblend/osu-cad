import axios, { AxiosError } from "axios";
import { IUnisonTokenProvider } from "@osucad/unison-client";
import { authenticate } from "@/composables/authenticate";

export const getToken = async (id: string): Promise<string> => {
  try {
    const response = await axios.get(
      "http://10.25.120.192:3000/editor/token/" + id,
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
      const error = e.cause as AxiosError | unknown;
      console.log(error)
      if (error instanceof AxiosError && error.response?.status === 403) {
        authenticate();
        
      }

      throw e;
    }),
};
