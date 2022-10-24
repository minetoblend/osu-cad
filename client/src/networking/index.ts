import {map, Subject} from "rxjs";

// import WebSocket from "ws";

export class Client<ServerToClient, ClientToServer> {


    connect() {

    }

    constructor(address: string) {
        this.ws = new WebSocket(address);
        this.ws.onopen = () => this.#onConnect.next()
        this.ws.onmessage = evt => { this.#onMessage.next(evt) }
    }

    private readonly ws: WebSocket

    readonly #onConnect = new Subject<void>();
    readonly #onMessage = new Subject<MessageEvent>()

    readonly onConnect = this.#onConnect.asObservable();
    readonly onMessage = this.#onMessage.pipe(map(evt => JSON.parse(evt.data)))

    send(message: ClientToServer) {
        this.ws.send(JSON.stringify(message))
    }

    close() {
        this.ws.close()
        this.#onMessage.complete()
    }
}