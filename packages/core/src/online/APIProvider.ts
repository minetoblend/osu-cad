import type { ReadonlyBindable } from '@osucad/framework';
import type { APIUser } from './APIUser';
import { Bindable, Component, resolved } from '@osucad/framework';

import { APIState } from './APIState';
import { IEndpointConfiguration } from './IEndpointConfiguration';

const MSG_LOGGED_IN = 'logged_in';
const MSG_LOGGED_OUT = 'logged_out';

export class APIProvider extends Component {
  readonly #state = new Bindable<APIState>(APIState.Offline);

  @resolved(IEndpointConfiguration)
  endpoints!: IEndpointConfiguration;

  get apiEndpoint() {
    return this.endpoints.apiV1Endpoint;
  }

  get state(): ReadonlyBindable<APIState> {
    return this.#state;
  }

  readonly #localUser = new Bindable<APIUser>(new GuestUser());

  get localUser(): ReadonlyBindable<APIUser> {
    return this.#localUser;
  }

  login() {
    const loginUrl = `${this.apiEndpoint}/auth/osu/login?redirectUrl=${encodeURIComponent(`${window.origin}/login-callback`)}`;

    const handle = window.open(`/login?url=${encodeURIComponent(loginUrl)}`, 'name', 'popup=true,menubar=false,width=500,height=600');
  }

  static #broadcastChannel = new BroadcastChannel('osucad_APIProvider');

  static onLoginCompleted() {
    this.#broadcastChannel.postMessage(MSG_LOGGED_IN);
  }

  protected override loadComplete() {
    super.loadComplete();

    APIProvider.#broadcastChannel.onmessage = evt => this.#onMessage(evt);

    this.#loadUser(true);
  }

  #onMessage(evt: MessageEvent) {
    if (evt.data === MSG_LOGGED_IN)
      this.#loadUser();
    else if (evt.data === MSG_LOGGED_OUT)
      this.#state.value = APIState.Offline;
  }

  async #loadUser(isFirstLoad = false) {
    try {
      this.#state.value = APIState.Connecting;
      await Promise.all([
        fetch(`${this.apiEndpoint}/users/me`, {
          credentials: 'include',
          priority: 'high',
        })
          .then((res) => {
            if (!res.ok)
              throw new Error(`Request failed with status ${res.status}`);

            return res.json();
          })
          .then(user => this.#localUser.value = user),
        new Promise<void>(resolve => setTimeout(resolve, isFirstLoad ? 0 : 300)),
      ]);
      this.#state.value = APIState.LoggedIn;
    }
    catch (e) {
      console.error('Error when loading user', e);
      this.#state.value = APIState.Offline;
    }
  }

  logout() {
    fetch(`${this.apiEndpoint}/auth/logout`, {
      credentials: 'include',
    }).then((res) => {
      if (res.ok)
        this.#state.value = APIState.Offline;
    });
    APIProvider.#broadcastChannel.postMessage(MSG_LOGGED_OUT);
  }
}

export class GuestUser implements APIUser {
  readonly id = -1;
  readonly username = 'Guest';
  readonly avatarUrl = '';
}
