#! /usr/bin/env bash

ROOT_DIR=$(dirname "$0")/../..
tmp=$(mktemp)
exit_code=0
errors=0

TEXT_RED="\e[31m"
TEXT_BLUE="\e[34m"
TEXT_RESET="\e[0m"
TEXT_BOLD="\e[1m"

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
      echo -e "${TEXT_BOLD}${TEXT_RED}>>> $(basename -- $locale_file) is not sorted by keys <<<${TEXT_RESET}"
      errors=1
    fi
  fi
done

[ "$errors" = 1 ] && echo -e "${TEXT_BOLD}${TEXT_BLUE}Please run $0 --fix to sort your locale definitions!${TEXT_RESET}";


exit $exit_code
