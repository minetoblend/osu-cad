import {watchThrottled} from "@vueuse/core";
import {reactive, ref} from "vue";
import {UnisonClientConnection, UserManager} from "@osucad/unison-client";
import {IClient} from "@osucad/unison";

export function useClientState<T>(
  connection: UnisonClientConnection,
  users: UserManager,
  key: string,
  initialValue?: T
) {
  const values = reactive(new Map<string, any>());

  users.getClientStateForAll(key).forEach(({ user, value }) => {
    values.set(user.clientId, value);
  });

  connection.on("clientState", (data: any) => {
    if (data.key === key) {
      console.log("clientState", data);

      values.set(data.client.clientId, data.value);
    }
  });

  users.on("userLeft", (user: IClient) => {
    values.delete(user.clientId);
  });

  const ownState = ref<T>();

  watchThrottled(
    ownState,
    (value) => {
      connection.emit("submitClientState", { key, value });
    },
    { throttle: 100 }
  );

  return {
    others: values,
    me: ownState,
  };
}
