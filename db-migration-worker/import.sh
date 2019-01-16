#!/bin/bash

for var in "SSH_USERNAME" "SSH_HOST" "MONGODB_USERNAME" "MONGODB_PASSWORD" "MONGODB_DATABASE" "NEO4J_USERNAME" "NEO4J_PASSWORD" "MONGODB_AUTH_DB"
do
  if [[ -z "${!var}" ]]; then
    echo "${var} is undefined"
    exit -1
  fi
done

echo "SSH_USERNAME             ${SSH_USERNAME}"
echo "SSH_HOST                 ${SSH_HOST}"
echo "MONGODB_USERNAME         ${MONGODB_USERNAME}"
echo "MONGODB_PASSWORD         ${MONGODB_PASSWORD}"
echo "MONGODB_DATABASE         ${MONGODB_DATABASE}"
echo "MONGODB_AUTH_DB          ${MONGODB_AUTH_DB}"
echo "NEO4J_USERNAME           ${NEO4J_USERNAME}"
echo "NEO4J_PASSWORD           ${NEO4J_PASSWORD}"
echo "-------------------------------------------------"

ssh -4 -M -S my-ctrl-socket -fnNT -L 27018:localhost:27017 -l ${SSH_USERNAME} ${SSH_HOST}
mongodump --host localhost -d ${MONGODB_DATABASE} --port 27018 --username ${MONGODB_USERNAME} --password ${MONGODB_PASSWORD} --authenticationDatabase ${MONGODB_AUTH_DB} --gzip --archive | mongorestore --gzip --archive
ssh -S my-ctrl-socket -O check -l ${SSH_USERNAME} ${SSH_HOST}
ssh -S my-ctrl-socket -O exit  -l ${SSH_USERNAME} ${SSH_HOST}

for collection in "categories" "badges" "users" "contributions" "comments" "follows" "shouts"
do
  mongoexport --db ${MONGODB_DATABASE} --collection $collection --out "/mongo-export/$collection.json"
done
