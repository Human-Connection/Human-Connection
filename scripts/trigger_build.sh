#!/usr/bin/env bash

body=$(cat<< EOF
{
 "request": {
   "message": "Triggered by \`$TRAVIS_REPO_SLUG\` on \`$TRAVIS_BRANCH\`",
   "config": {
     "merge_mode": "deep_merge",
     "env": {
       "COMMON_BRANCH": "$TRAVIS_BRANCH"
     }
    }
  }
}
EOF
)

curl -s -X POST \
   -H "Content-Type: application/json" \
   -H "Accept: application/json" \
   -H "Travis-API-Version: 3" \
   -H "Authorization: token $TRAVIS_TOKEN" \
   -d "$body" \
   https://api.travis-ci.com/repo/Human-Connection%2FHuman-Connection/requests
