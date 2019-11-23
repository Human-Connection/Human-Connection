#!/bin/sh
#{
#    "keys": [
#        {
#            "key_name": "TEST.DONT.TRANSLATE",
#            "description": "Test, don't translate",
#            "platforms": [
#                "web"
#            ],
#            "translations": [
#                {
#                    "language_iso": "en",
#                    "translation": "Test, don't translate"
#                }
#            ]
#        }
#    ]
#}


~/bin/lokalise2 key create --token $MY_LOKALISE_TOKEN \
  --project-id 556252725c18dd752dd546.13222042    \
  --key-name     "TEST.DONT.TRANSLATE"            \
  --platforms    '"web"'                          \
  --filenames    '{"web": "webapp/locales/%LANG_ISO%.json"}' \
  --translations '[{"language_iso":"en", "translation":"en:TEST.DONT.TRANSLATE"}]' | grep '"key_id":'
  
  #--context   "TEST.DONT.TRANSLATE"            
  #--description "TEST.DONT.TRANSLATE"

# see also https://lokalise.com/api2docs/curl/#transition-create-keys-post