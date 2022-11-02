<picture style="width:50%;" align="center">
  <source media="(prefers-color-scheme: dark)" srcset="/assets/title-card.png">
  <source media="(prefers-color-scheme: light)" srcset="/assets/title-card-light.png">
  <img alt="osucad logo" src="title-card.png">
</picture>

## how to run

### web client
```sh
cd client
npm run serve
```

### gameserver & api
Create .env file in server/
```
OSU_CLIENT_ID=
OSU_CLIENT_SECRET=
OSU_OAUTH_CALLBACK=http(s)://host/auth/osu
OSU_SCOPES=public,identify
JWT_SECRET=
```

```sh
docker-compose up
```

### wasm library (required for client)
```sh
cd wasm
wasm-pack build --target web
```
