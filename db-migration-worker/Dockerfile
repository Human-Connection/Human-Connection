FROM mongo:latest

RUN apt-get update
RUN apt-get -y install openssh-client
COPY .ssh /root/.ssh/
COPY import.sh .

