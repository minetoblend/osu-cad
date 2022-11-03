<p align="center">
    <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./osucad.svg">
    <img alt="osucad logo" src="./osucad-dark.svg" width="300">
    </picture>
</p>

![shield](https://img.shields.io/github/license/minetoblend/osu-cad?style=flat-square)

# About

osucad is a collabroative editor for osu! standard beatmaps.

# Development Setup

## Requirements

- [Docker](https://www.docker.com/)
- [Node.js](https://nodejs.org/)
- [cargo](https://www.rust-lang.org/tools/install)
- [wasm-pack](https://rustwasm.github.io/wasm-pack/)

## Rest server

### .env

Create `.env` file in `server/`

You can create an osu! oauth application [here](https://osu.ppy.sh/home/account/edit#oauth).
Note: Callback URL MUST be `<host>/auth/osu`

```yaml
OSU_CLIENT_ID=
OSU_CLIENT_SECRET=
OSU_OAUTH_CALLBACK=http://localhost:3000/auth/osu
OSU_SCOPES=public,identify
JWT_SECRET=
```

### Running the server

```sh
docker-compose up
```

## Game sever

### Running the server

```sh
cd gameserver
cargo run
```

### Generating type definitions for client
This is required after modifying any of the commands sent between the game server and the client.
Webpack sometimes doesn't register the change properly, just restart the dev server in that case.
```sh
cd gameserver
cargo test
```

_For some reason ts-rs uses `cargo test` command to generate types, don't ask me why_

## Web client

### Building the WASM library

```sh
cd wasm
wasm-pack build --target web
```

### Running the client

```sh
cd client
npm install
npm run serve
```
Local website will be found at [http://localhost:8080](http://localhost:8080)
