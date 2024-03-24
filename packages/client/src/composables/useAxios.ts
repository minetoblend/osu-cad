import axios from 'axios';
import 'pinia';
import { getActivePinia } from 'pinia';

export function useAxios() {
  if (import.meta.env.SSR) {
    const pinia = getActivePinia();

    return axios.create({
      headers: {
        Cookie: pinia?.ssrContext?.cookie,
      },
    });
  } else {
    return axios.create({});
  }
}
