import {ref} from "vue";
import {UserInfo} from "@osucad/common";


export function useCurrentUser() {
  const user = ref<UserInfo | null>(
    JSON.parse(
      document.getElementById("user-data")!.textContent!,
    ),
  );


  return { user };
}