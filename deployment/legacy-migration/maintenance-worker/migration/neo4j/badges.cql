/*
// Alpha Model
// [ ] Not modeled in Nitro
// [X] Modeled in Nitro
// [-] Omitted in Nitro
// [?] Unclear / has work to be done for Nitro
    {
[?]   image: {
[?]     path: { // Path is incorrect in Nitro - is icon the correct name for this field?
[X]       type: String,
[X]       required: true
        },
[ ]     alt: { // If we use an image - should we not have an alt?
[ ]       type: String,
[ ]       required: true
        }
      },
[?]   status: { 
[X]     type: String, 
[X]     enum: ['permanent', 'temporary'], 
[ ]     default: 'permanent', // Default value is missing in Nitro
[X]     required: true
      },
[?]   type: {
[?]     type: String, // in nitro this is a defined enum - seems good for now
[X]     required: true
      },
[X]   key: {
[X]     type: String,
[X]     required: true
      },
[?]   createdAt: {
[?]     type: Date, // Type is modeled as string in Nitro which is incorrect
[ ]     default: Date.now // Default value is missing in Nitro
      }, 
[?]   updatedAt: {
[?]     type: Date, // Type is modeled as string in Nitro which is incorrect
[ ]     default: Date.now // Default value is missing in Nitro
      }
    }
*/

CALL apoc.load.json("file:${IMPORT_CHUNK_PATH_CQL_FILE}") YIELD value as badge
MERGE(b:Badge {id: badge._id["$oid"]})
ON CREATE SET
b.key       = badge.key,
b.type      = badge.type,
b.icon      = badge.image.path,
b.status    = badge.status,
b.createdAt = badge.createdAt.`$date`,
b.updatedAt = badge.updatedAt.`$date`
;
