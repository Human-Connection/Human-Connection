#! /usr/bin/env bash

ROOT_DIR=$(dirname "$0")/..
english="$ROOT_DIR/webapp/locales/en.json"
german="$ROOT_DIR/webapp/locales/de.json"
listPaths="jq -c 'path(..)|[.[]|tostring]|join(\".\")'"
if eval "diff -q <( $listPaths < $english ) <( $listPaths < $german  )";
then
  : # all good
else
  eval "diff -y <( $listPaths < $english ) <( $listPaths < $german  )";
  printf "\nEnglish and German translation keys do not match, see diff above.\n"
  exit 1
fi
