#!/usr/bin/env bash

for var in "SSH_USERNAME" "SSH_HOST" "MONGODB_USERNAME" "MONGODB_PASSWORD" "MONGODB_DATABASE" "MONGODB_AUTH_DB" "UPLOADS_DIRECTORY"
do
  if [[ -z "${!var}" ]]; then
    echo "${var} is undefined"
    exit 1
  fi
done

echo "SSH_USERNAME             ${SSH_USERNAME}"
echo "SSH_HOST                 ${SSH_HOST}"
echo "MONGODB_USERNAME         ${MONGODB_USERNAME}"
echo "MONGODB_PASSWORD         ${MONGODB_PASSWORD}"
echo "MONGODB_DATABASE         ${MONGODB_DATABASE}"
echo "MONGODB_AUTH_DB          ${MONGODB_AUTH_DB}"
echo "UPLOADS_DIRECTORY        ${UPLOADS_DIRECTORY}"
echo "-------------------------------------------------"

mongo ${MONGODB_DATABASE} --eval "db.dropDatabase();"
rm -f /mongo-export/*

ssh -4 -M -S my-ctrl-socket -fnNT -L 27018:localhost:27017 -l ${SSH_USERNAME} ${SSH_HOST}
mongodump --host localhost -d ${MONGODB_DATABASE} --port 27018 --username ${MONGODB_USERNAME} --password ${MONGODB_PASSWORD} --authenticationDatabase ${MONGODB_AUTH_DB} --gzip --archive | mongorestore --gzip --archive
ssh -S my-ctrl-socket -O check -l ${SSH_USERNAME} ${SSH_HOST}
ssh -S my-ctrl-socket -O exit  -l ${SSH_USERNAME} ${SSH_HOST}

rsync --archive --update --verbose ${SSH_USERNAME}@${SSH_HOST}:${UPLOADS_DIRECTORY}/* /uploads/

for collection in "categories" "badges" "users" "contributions" "comments" "follows" "shouts"
do
  mongoexport --db ${MONGODB_DATABASE} --collection $collection --out "/mongo-export/$collection.json"
done
