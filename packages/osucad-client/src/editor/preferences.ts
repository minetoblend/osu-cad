import axios from "axios";
import {IPreferences} from "@osucad/common";
import {ref} from "vue";

export async function getEditorPreferences() {
  const preferences = ref<IPreferences>();

  const response = await axios.get(
    `${import.meta.env.VITE_API_ENDPOINT}/editor/preferences`,
    {
      withCredentials: true,
    }
  );

  preferences.value = response.data;

  return preferences;
}
