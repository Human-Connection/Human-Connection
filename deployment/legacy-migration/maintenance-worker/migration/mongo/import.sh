#!/usr/bin/env bash
set -e

echo "SSH_USERNAME             ${SSH_USERNAME}"
echo "SSH_HOST                 ${SSH_HOST}"
echo "MONGODB_USERNAME         ${MONGODB_USERNAME}"
echo "MONGODB_PASSWORD         ${MONGODB_PASSWORD}"
echo "MONGODB_DATABASE         ${MONGODB_DATABASE}"
echo "MONGODB_AUTH_DB          ${MONGODB_AUTH_DB}"
echo "-------------------------------------------------"


rm -rf /tmp/mongo-export/*
mkdir -p /tmp/mongo-export/

ssh -4 -M -S my-ctrl-socket -fnNT -L 27018:localhost:27017 -l ${SSH_USERNAME} ${SSH_HOST}

for collection in "categories" "badges" "users" "contributions" "comments" "follows" "shouts"
do
  mongoexport --db ${MONGODB_DATABASE} --host localhost -d ${MONGODB_DATABASE} --port 27018 --username ${MONGODB_USERNAME} --password ${MONGODB_PASSWORD} --authenticationDatabase ${MONGODB_AUTH_DB} --collection $collection  --collection $collection --out "/tmp/mongo-export/$collection.json"
  mkdir -p /tmp/mongo-export/splits/$collection/
  split -l 500 /tmp/mongo-export/$collection.json /tmp/mongo-export/splits/$collection/
done

ssh -S my-ctrl-socket -O check -l ${SSH_USERNAME} ${SSH_HOST}
ssh -S my-ctrl-socket -O exit  -l ${SSH_USERNAME} ${SSH_HOST}
