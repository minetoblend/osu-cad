import {IClient, ISignalMessage} from "@osucad/unison";
import {SignalManager, UnisonClientConnection, UserManager} from "@osucad/unison-client";
import {reactive, readonly, ref} from "vue";

export function useConnectedUsers(
  userManager: UserManager,
  signals: SignalManager,
  connection: UnisonClientConnection,
) {
  const users = ref<IClient[]>([userManager.me, ...userManager.others]);

  const state = reactive(new Map<string, Map<string, any>>());

  const currentTimes = reactive(
    new Map<
      string,
      { time: number; isPlaying: boolean; playbackSpeed: number }
    >()
  );

  userManager.on("userJoined", () => {
    users.value = [userManager.me, ...userManager.others];
  });

  userManager.on("userLeft", (user) => {
    users.value = [userManager.me, ...userManager.others];
    currentTimes.delete(user.clientId);
  });

  signals.on("currentTime", (time, message: ISignalMessage) => {
    if (message.clientId !== userManager.me.clientId)
      currentTimes.set(message.clientId, time as any);
  });



  return {
    users,
    currentTimes: readonly(currentTimes),
  };
}
