#! /usr/bin/env bash

ERRORS=false
FIX=false

for arg in "$@"
do
    if [ "$arg" == "--fix" ]
    then
        FIX=true
    fi
done

# normalize the locale file. WS 2 blanks, keys are sorted
if  $FIX ; then
    for locale_file in locales/*.json
    do
	jq --sort-keys . $locale_file > locales/tmp.json
	mv locales/tmp.json $locale_file
    done
    exit 0
fi

# check if keys are sorted alphabetically and WS is two blanks
for locale_file in locales/*.json
do
    jq --sort-keys . $locale_file | diff -q $locale_file - > /dev/null && echo "$locale_file is OK" ||
	    { ERRORS=true ; echo "$locale_file is not normalized" ; }
done

# check if all the keys in en.json are present in de.json and vice versa

# TO DO!!


# Exit with status 1 if there were errors

if $ERRORS ; then
    echo "Some locale files are not normalized."
    exit 1
else
    echo "All locales are normalized."
    exit 0
fi
