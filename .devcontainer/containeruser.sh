#!/bin/bash

export USERNAME="${USERNAME:-vscode}"
export USER_UID=${USER_ID:-1000}
export USER_GID=$USER_UID

# Create a non-root user to use if not already available - see https://aka.ms/vscode-remote/containers/non-root-user.
if [ $(getent passwd $USERNAME) ]; then
    # If exists, see if we need to tweak the GID/UID
    if [ "$USER_GID" != "1000" ] || [ "$USER_UID" != "1000" ]; then
        groupmod --gid $USER_GID $USERNAME \
        && usermod --uid $USER_UID --gid $USER_GID $USERNAME \
        && chown -R $USER_UID:$USER_GID /home/$USERNAME;
    fi; 
else
    # Otherwise ccreate the non-root user
    # Add sudo support for the non-root user
    groupadd --gid $USER_GID $USERNAME \
    && useradd -s /bin/bash --uid $USER_UID --gid $USER_GID -m $USERNAME;
fi

if [ ! -f "/etc/sudoers.d/${USERNAME}" ] ; then
    echo $USERNAME ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/$USERNAME \
    && chmod 0440 /etc/sudoers.d/$USERNAME
fi
