#!/usr/bin/env bash

if [[ -v TRAVIS_TOKEN ]]; then
  # You need a Travis token to trigger the build on our meta repository.
  # This token will not be available on forks of this repo.
  curl -L https://raw.githubusercontent.com/Human-Connection/Human-Connection/master/scripts/trigger_build.sh > scripts/trigger_build.sh
  chmod +x scripts/trigger_build.sh
  ./scripts/trigger_build.sh
fi
