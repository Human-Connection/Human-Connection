#! /usr/bin/env bash

ROOT_DIR=$(dirname "$0")/../..
tmp=$(mktemp)
exit_code=0

for locale_file in $ROOT_DIR/webapp/locales/*.json
do
  jq -f $(dirname "$0")/sort_filter.jq $locale_file > "$tmp"
  if [ "$*" == "--fix" ]
  then
    mv "$tmp" $locale_file
  else
    if diff -q "$tmp" $locale_file > /dev/null ;
    then
      : # all good
    else
      exit_code=$?
      echo "$(basename -- $locale_file) is not sorted by keys"
    fi
  fi
done

exit $exit_code
