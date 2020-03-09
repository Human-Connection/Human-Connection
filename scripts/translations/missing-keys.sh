#! /usr/bin/env bash

ROOT_DIR=$(dirname "$0")/../..

sorting="jq -f $ROOT_DIR/scripts/translations/sort_filter.jq"
english="$sorting $ROOT_DIR/webapp/locales/en.json"
german="$sorting $ROOT_DIR/webapp/locales/de.json"
listPaths="jq -c 'path(..)|[.[]|tostring]|join(\".\")'"
diffString="<( $english | $listPaths ) <( $german | $listPaths )"
if eval "diff -q $diffString";
then
  : # all good
else
  eval "diff -y $diffString | grep '[|<>]'";
  printf "\nEnglish and German translation keys do not match, see diff above.\n"
  exit 1
fi
