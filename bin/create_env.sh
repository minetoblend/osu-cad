function replace_env() {
    sed -i~ '/^'"$1"'/s/=.*/='"$2"'/' .env
}

function create_env() {
  cp .env.example .env
  replace_env SESSION_SECRET "$(openssl rand -hex 32)"
  replace_env S3_SECRET_ACCESS_KEY "$(openssl rand -hex 32)"
  replace_env MYSQL_ROOT_PASSWORD "$(openssl rand -hex 32)"
  replace_env MYSQL_PASSWORD "$(openssl rand -hex 32)"
  echo "Done"

  echo "A few more values are needed to run the server, please add the following:"
  echo "  - OSU_OAUTH_CLIENT_ID"
  echo "  - OSU_OAUTH_CLIENT_SECRET"
  echo "  - OSU_OAUTH_REDIRECT_URI"
}

function clear_docker_data() {
printf 'Resetting the environment requires clearing all data. Do you want to continue? [Y/n]:'
  read answer

  case $answer in
    "" ) docker-compose -f dev-compose.yml down -v;;
    [Yy]* ) docker-compose -f dev-compose.yml down -v;;
    [Nn]* ) echo "Skipping volume removal";;
    * ) echo "Invalid input. Skipping volume removal"; exit 1;;
  esac
}


if [ -f .env ]; then
  printf 'a .env file already exists. Do you want to overwrite it? [Y/n]: '
  read answer

  case $answer in
    "" ) create_env; clear_docker_data;;
    [Yy]* ) create_env; clear_docker_data;;
    [Nn]* ) echo "Skipping .env creation";;
    * ) echo "Invalid input. Skipping .env creation"; exit 1;;
  esac
else
  create_env
fi
