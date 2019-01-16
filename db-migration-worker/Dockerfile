FROM mongo:latest
ARG KNOWN_HOST

RUN apt-get update
RUN apt-get -y install openssh-client
COPY id_rsa /root/.ssh/id_rsa
# RUN ssh-keyscan -H $KNOWN_HOST >> /root/.ssh/known_hosts
COPY import.sh .

