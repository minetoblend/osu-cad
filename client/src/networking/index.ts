import {concatMap, Subject} from "rxjs";
import {Writer} from "protobufjs/minimal";

// import WebSocket from "ws";

export class Client<ServerToClient, ClientToServer> {


    connect() {

    }

    constructor(private readonly decoder: { decode(data: Uint8Array, length?: number): ServerToClient },
                private readonly encoder: { encode(message: ClientToServer): Writer },
                address: string) {
        this.ws = new WebSocket(address);
        this.ws.onopen = () => this.#onConnect.next()
        this.ws.onmessage = evt => this.#onMessage.next(evt)
    }

    private readonly ws: WebSocket

    readonly #onConnect = new Subject<void>();
    readonly #onMessage = new Subject<MessageEvent>()

    readonly onConnect = this.#onConnect.asObservable();
    readonly onMessage = this.#onMessage.pipe(concatMap(evt => {
        const res$ = new Subject<ServerToClient>();

        (evt.data as Blob).arrayBuffer().then(buff => {
            const decoded = this.decoder.decode(new Uint8Array(buff))
            res$.next(decoded)
            res$.complete()
        }).catch(() => {
            res$.complete()
        })

        return res$
    }))

    send(message: ClientToServer) {

        const buffer = this.encoder.encode(message).finish()

        this.ws.send(buffer)
    }

    close() {
        this.ws.close()
        this.#onMessage.complete()
    }
}