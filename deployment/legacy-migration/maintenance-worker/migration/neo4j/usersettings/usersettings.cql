/*
// Alpha Model
// [ ] Not modeled in Nitro
// [X] Modeled in Nitro
// [-] Omitted in Nitro
// [?] Unclear / has work to be done for Nitro
    {
[ ]   userId: {
[ ]     type: String,
[ ]     required: true,
[ ]     unique: true
      },
[ ]   blacklist: {
[ ]     type: Array,
[ ]     default: []
      },
[ ]   uiLanguage: {
[ ]     type: String,
[ ]     required: true
      },
[ ]   contentLanguages: {
[ ]     type: Array,
[ ]     default: []
      },
[ ]   filter: {
[ ]     categoryIds: {
[ ]       type: Array,
[ ]       index: true
        },
[ ]     emotions: {
[ ]       type: Array,
[ ]       index: true
        }
      },
[ ]   hideUsersWithoutTermsOfUseSigniture: {type: Boolean},
[ ]   updatedAt: {
[ ]     type: Date,
[ ]     default: Date.now
      }
    }
*/

CALL apoc.load.json("file:${IMPORT_CHUNK_PATH_CQL_FILE}") YIELD value as usersetting;
