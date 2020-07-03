#!/bin/bash
echo $(whoami)
[ -f "${HOME}/dotfiles/install.sh" ] && "${HOME}/dotfiles/install.sh"

/usr/local/share/docker-init.sh

[ -x "/workspace/Human-Connection/deployment/codespaces/bootstrap.sh" ] && \
  bash "/workspace/Human-Connection/deployment/codespaces/bootstrap.sh"


"$@"

