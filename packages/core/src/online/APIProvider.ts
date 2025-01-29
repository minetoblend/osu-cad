import type { ReadonlyBindable } from '@osucad/framework';
import type { APIUser } from './APIUser';
import { Bindable, Component } from '@osucad/framework';

import { APIState } from './APIState';

const MSG_LOGGED_IN = 'logged_in';
const MSG_LOGGED_OUT = 'logged_out';

export class APIProvider extends Component {
  readonly #state = new Bindable<APIState>(APIState.Offline);

  readonly baseUrl = import.meta.env.VITE_API_BASE_URL;

  get state(): ReadonlyBindable<APIState> {
    return this.#state;
  }

  readonly #localUser = new Bindable<APIUser>(new GuestUser());

  get localUser(): ReadonlyBindable<APIUser> {
    return this.#localUser;
  }

  login() {
    const loginUrl = `${this.baseUrl}/auth/osu/login`;

    const handle = window.open(loginUrl, 'name', 'popup=true,menubar=false,width=500,height=600');
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
        fetch('http://localhost:3001/users/me', {
          credentials: 'include',
        })
          .then(res => res.json())
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
    fetch(`${this.baseUrl}/auth/logout`, {
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
