import { reactive } from "vue";
import { IClient } from "@osucad/unison";
import { UnisonClientConnection } from "./client";
import EventEmitter from "events";

export class UserManager extends EventEmitter {
  me: IClient;

  others: IClient[] = [];

  state = reactive(new Map<string, Map<string, any>>());

  constructor(private readonly connection: UnisonClientConnection) {
    super();

    connection.on("userJoined", (user: IClient, users: IClient[]) =>
      this.#updateUsers("userJoined", user, users)
    );

    connection.on("userLeft", (user: IClient, users: IClient[]) => {
      this.#updateUsers("userLeft", user, users);
      this.state.delete(user.clientId);
    });

    function setClientState(key: string, value: any) {
      connection.emit("submitClientState", { key, value });
    }

    connection.on("initClientState", (data: any) => {
      data.forEach(({ clientId, state }: any) => {
        if (!this.state.has(clientId)) {
          this.state.set(clientId, new Map());
        }
        state.forEach(([key, value]: any) => {
          this.state.get(clientId)!.set(key, value);
          this.emit("clientStateChanged", clientId, key, value);
        });
      });
      console.log(this.state);
    });

    connection.on("clientState", (data: any) => {
      const { client, key, value } = data;
      if (!this.state.has(client.clientId)) {
        this.state.set(client.clientId, new Map());
      }

      this.state.get(client.clientId)!.set(key, value);
      this.emit("clientStateChanged", client.clientId, key, value);
    });
  }

  #updateUsers(event: string, user: IClient, users: IClient[]) {
    this.me = users.find((u) => u.clientId === this.connection.id);
    this.others = users.filter((u) => u.clientId !== this.connection.id);

    this.emit(event, user, this.others);
  }

  getClientState(id: string, key: string) {
    return this.state.get(id)?.get(key);
  }

  getClientStateForAll(key: string) {
    return this.others.map((user) => ({
      user,
      value: this.state.get(user.clientId)?.get(key),
    }));
  }

  setClientState(key: string, value: any) {
    this.connection.socket.emit("submitClientState", { key, value });
  }
}
