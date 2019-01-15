#!/bin/bash

for var in "SSH_USERNAME" "SSH_HOST" "MONGODB_USERNAME" "MONGODB_PASSWORD" "MONGODB_DATABASE" "NEO4J_USER" "NEO4J_PASSWORD"
do
  if [[ -z "${!var}" ]]; then
    echo "${var} is undefined"
    exit -1
  fi
done

OUTPUT_FILE_NAME=${OUTPUT:-human-connection-dump}_$(date -I).archive

echo "SSH_USERNAME             ${SSH_USERNAME}"
echo "SSH_HOST                 ${SSH_HOST}"
echo "MONGODB_USERNAME         ${MONGODB_USERNAME}"
echo "MONGODB_PASSWORD         ${MONGODB_PASSWORD}"
echo "MONGODB_DATABASE         ${MONGODB_DATABASE}"
echo "NEO4J_USER               ${NEO4J_USER}"
echo "NEO4J_PASSWORD           ${NEO4J_PASSWORD}"
echo "OUTPUT_FILE_NAME         ${OUTPUT_FILE_NAME}"
echo "GPG_PASSWORD             ${GPG_PASSWORD:-<none>}"
echo "-------------------------------------------------"

ssh -M -S my-ctrl-socket -fnNT -L 27018:localhost:27017 -l ${SSH_USERNAME} ${SSH_HOST}

if [[ -z "${!GPG_PASSWORD}" ]]; then
  mongodump --host localhost -d ${MONGODB_DATABASE} --port 27018 --username ${MONGODB_USERNAME} --password ${MONGODB_PASSWORD} --authenticationDatabase admin --gzip --archive | gpg -c --batch --passphrase ${GPG_PASSWORD} --output ${OUTPUT_FILE_NAME}.gpg
else
  mongodump --host localhost -d ${MONGODB_DATABASE} --port 27018 --username ${MONGODB_USERNAME} --password ${MONGODB_PASSWORD} --authenticationDatabase admin --gzip --archive=${OUTPUT_FILE_NAME}
fi


ssh -S my-ctrl-socket -O check -l ${SSH_USERNAME} ${SSH_HOST}
ssh -S my-ctrl-socket -O exit  -l ${SSH_USERNAME} ${SSH_HOST}



