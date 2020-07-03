#!/bin/bash
echo $(whoami)
[ -f "${HOME}/dotfiles/install.sh" ] && "${HOME}/dotfiles/install.sh"

/usr/local/share/docker-init.sh

[ -x "${HOME}/workspace/Human-Connection/deployment/codespaces/bootstrap.sh" ] && \
  bash "${HOME}/workspace/Human-Connection/deployment/codespaces/bootstrap.sh"


"$@"

