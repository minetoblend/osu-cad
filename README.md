# osucad <a href='https://ko-fi.com/maarvin' target='_blank'><img height='35' style='border:0px;height:35px;' src='https://img.shields.io/badge/Kofi-F16061.svg?logo=ko-fi&logoColor=white' border='0' alt='Support me on ko-fi.com' /></a>

osucad is a browser based osu editor with real-time collaboration.

## Setup

Make sure to use WSL2 on Windows, you are probably going to run into issues otherwise.

```
git clone https://github.com/minetoblend/osu-cad.git
cd osucad
pnpm install
bin/create_env.sh
```

The `bin/create_env.sh` script will generate a `.env` file with some default values. The following values will need to 
be provided manually:

```
OSU_OAUTH_CLIENT_ID=
OSU_OAUTH_CLIENT_SECRET=
OSU_OAUTH_REDIRECT_URI=
```
You can obtain these values by creating an osu! OAuth application [here](https://osu.ppy.sh/home/account/edit#oauth).

## Starting the development server

*Requres a valid `.env` file.*

```bash
bin/dev_docker.sh -d
# omit -d to run in the foreground
# add --build to rebuild the docker images
# bin/dev_docker.sh -d --build
```

*Note: You can also use `docker-compose` to manage the services, but you need to make sure to add `-f dev-compose.yml` 
to the command.*

You can regenerate the `.env` file by running the following command:
```bash
bin/create_env.sh
```
Some of the docker containers need to have their data wiped afer the environment variables have changed, so this script 
will ask you if it should also remove the docker volumes.

## Docker services
You can find the complete spec of services in the `dev-compose.yml` file.

| Name         | Description                                                                   |
|--------------|-------------------------------------------------------------------------------|
| `api-server` | Will run the backend server for osucad.                                       |
| `client`     | A vite dev sever that serves the website & editor uis.                        |
| `common`     | Contains code shared by other packages.                                       |
| `mysql`      | A mysql database for storing user & beatmap data.                             |
| `redis`      | Stores session values & used for [bull](https://github.com/OptimalBits/bull). |
| `minio`      | S3-compatible storage, used primarily for beatmap assets.                     |
| `caddy`      | Reverse proxy that maps the api-server & client to the same domain.           |

## Notes

Some features need a https connection to work properly, to do this prepend the `HOSTNAME` variable in the `.env` file
with `https://`.
