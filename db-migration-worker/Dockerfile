FROM mongo:4

RUN apt-get update \
 && apt-get -y install --no-install-recommends openssh-client \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*
COPY .ssh /root/.ssh/
COPY import.sh .

