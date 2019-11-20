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

keyid=31738989

~/bin/lokalise2 key delete --token $MY_LOKALISE_TOKEN --project-id 556252725c18dd752dd546.13222042 --key-id $keyid
