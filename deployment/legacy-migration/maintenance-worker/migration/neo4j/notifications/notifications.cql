/*
// Alpha Model
// [ ] Not modeled in Nitro
// [X] Modeled in Nitro
// [-] Omitted in Nitro
// [?] Unclear / has work to be done for Nitro
    {
[ ]   userId: { // User this notification is sent to
[ ]     type: String,
[ ]     required: true,
[-]     index: true
      },
[ ]   type: {
[ ]     type: String,
[ ]     required: true,
[ ]     enum: ['comment','comment-mention','contribution-mention','following-contribution']
      },
[ ]   relatedUserId: {
[ ]     type: String,
[-]     index: true
      },
[ ]   relatedContributionId: {
[ ]     type: String,
[-]     index: true
      },
[ ]   relatedOrganizationId: {
[ ]     type: String,
[-]     index: true
      },
[ ]   relatedCommentId: {type: String },
[ ]   unseen: {
[ ]     type: Boolean,
[ ]     default: true,
[-]     index: true
      },
[ ]   createdAt: {
[ ]     type: Date,
[ ]     default: Date.now
      },
[ ]   updatedAt: {
[ ]     type: Date,
[ ]     default: Date.now
      },
[ ]   wasSeeded: { type: Boolean }
  }
*/

CALL apoc.load.json("file:${IMPORT_CHUNK_PATH_CQL_FILE}") YIELD value as notification;
