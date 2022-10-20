#osu!cad

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
