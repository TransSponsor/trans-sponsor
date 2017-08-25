#!/usr/bin/env bash

# sed -i "s/username_placeholder/$DATABASE_USERNAME/" api/config/prod.secret.exs
# sed -i "s/password_placeholder/$DATABASE_PASSWORD/" api/config/prod.secret.exs
# sed -i "s/database_placeholder/$DATABASE_DATABASE/" api/config/prod.secret.exs
# sed -i "s/dbhost_placeholder/$DATABASE_HOST/" api/config/prod.secret.exs

cd api || exit

eval "$( aws ecr get-login --region us-west-2 )"
# docker build -t ts-api .
# docker tag ts-api:latest 194812415682.dkr.ecr.us-west-2.amazonaws.com/ts-api:latest
# docker push 194812415682.dkr.ecr.us-west-2.amazonaws.com/ts-api:latest
