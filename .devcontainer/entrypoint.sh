#!/bin/bash
echo $(whoami)
[ -f "${HOME}/dotfiles/install.sh" ] && "${HOME}/dotfiles/install.sh"

/usr/local/share/docker-init.sh

if [ -f "/workspace/Human-Connection/deployment/codespaces/bootstrap.sh" ] ; then
  echo "setting up Human-Connection"
  "/workspace/Human-Connection/deployment/codespaces/bootstrap.sh"
fi

"$@"

