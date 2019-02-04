FROM mongo:4

RUN apt-get update \
 && apt-get -y install --no-install-recommends openssh-client rsync \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*
COPY import.sh .

