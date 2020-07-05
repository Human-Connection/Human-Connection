#!/bin/bash
echo $(whoami)
[ -f "${HOME}/dotfiles/install.sh" ] && "${HOME}/dotfiles/install.sh"

/usr/local/share/docker-init.sh
sudo mv /bin/profile_devcontainer_alias.sh /etc/profile.d/profile_devcontainer_alias.sh
"$@"

