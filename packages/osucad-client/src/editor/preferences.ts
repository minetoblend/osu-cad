import axios from "axios";
import {IPreferences} from "@osucad/common";
import {ref} from "vue";

export async function getEditorPreferences() {
  const preferences = ref<IPreferences>();

  const response = await axios.get(
    "http://10.25.120.192:3000/editor/preferences",
    {
      withCredentials: true,
    }
  );

  preferences.value = response.data;

  return preferences;
}
