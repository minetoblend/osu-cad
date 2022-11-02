<picture>
<source media="(prefers-color-scheme: dark)" srcset="./osucad.svg">
<img alt="osucad logo" src="./osucad-dark.svg" width="300">
</picture>

![shield](https://img.shields.io/github/license/minetoblend/osu-cad?style=flat-square)

# About
osucad is a collabroative editor for osu! standard beatmaps.

# Development Setup
## Requirements
- (Windows only) [Windows Subsystem for Linux 2 Kernel](https://docs.microsoft.com/windows/wsl/wsl2-kernel)
- [Docker](https://www.docker.com/)
    - If on Windows, computer MUST be restarted before running `docker-compose`
- [Node.js](https://nodejs.org/)
    - Must be installed on PATH.
- [rustup](https://www.rust-lang.org/tools/install)
- [wasm-pack](https://rustwasm.github.io/wasm-pack/)

## Gameserver & API
### .env
Create `.env` file in `server/`

You can grab the osu! api information [here](https://osu.ppy.sh/home/account/edit#oauth).
Note: Callback URL MUST be `http://localhost:3000/auth/osu`
```yaml
OSU_CLIENT_ID=
OSU_CLIENT_SECRET=
OSU_OAUTH_CALLBACK=http://localhost:3000/auth/osu
OSU_SCOPES=public,identify
JWT_SECRET=
```
_JWT Secret can be a random string of letters and numbers if not used for production._
### local.yml
Create `local.yml` in root directoy.
```yml
console:
  max_message_size_bytes: 409600
logger:
  level: "INFO"
runtime:
  js_entrypoint: "build/index.js"
session:
  token_expiry_sec: 7200 # 2 hours
socket:
  max_message_size_bytes: 4096 # reserved buffer
  max_request_size_bytes: 131072
```

### Starting the servers
To start the servers, run the teminal command below in the root directory.
```sh
docker-compose up
```

## Web Client

### WebAssembly Library
```sh
cd wasm
wasm-pack build --target web
```
### Client

```sh
cd client
npm run serve
```
Local website will be found at [http://localhost:8080](http://localhost:8080)
