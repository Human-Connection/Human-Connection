/*
// Alpha Model
// [ ] Not modeled in Nitro
// [X] Modeled in Nitro
// [-] Omitted in Nitro
// [?] Unclear / has work to be done for Nitro
    {
[X]   userId: {
[X]     type: String,
[X]     required: true,
[-]     index: true
      },
[X]   contributionId: {
[X]     type: String,
[X]     required: true,
[-]     index: true
      },
[?]   rated: {
[X]     type: String,
[ ]     required: true,
[?]     enum: ['funny', 'happy', 'surprised', 'cry', 'angry']
      },
[X]   createdAt: {
[X]     type: Date,
[X]     default: Date.now
      },
[X]   updatedAt: {
[X]     type: Date,
[X]     default: Date.now
      },
[-]   wasSeeded: { type: Boolean }
    }
*/

CALL apoc.load.json("file:${IMPORT_CHUNK_PATH_CQL_FILE}") YIELD value as emotion
MATCH (u:User {id: emotion.userId}),
      (c:Post {id: emotion.contributionId})
MERGE  (u)-[e:EMOTED {
          id:        emotion._id["$oid"],
          emotion:   emotion.rated,
          createdAt: datetime(emotion.createdAt.`$date`),
          updatedAt: datetime(emotion.updatedAt.`$date`)
        }]->(c)
RETURN e;
/*
  // Queries
  // user sets an emotion emotion:
  // MERGE (u)-[e:EMOTED {id: ..., emotion: "funny", createdAt: ..., updatedAt: ...}]->(c)
  // user removes emotion
  // MATCH  (u)-[e:EMOTED]->(c) DELETE e
  // contribution distributions over every `emotion` property value for one post
  // MATCH (u:User)-[e:EMOTED]->(c:Post {id: "5a70bbc8508f5b000b443b1a"}) RETURN e.emotion,COUNT(e.emotion)
  // contribution distributions over every `emotion` property value for one user (advanced - "whats the primary emotion used by the user?")
  // MATCH (u:User{id:"5a663b1ac64291000bf302a1"})-[e:EMOTED]->(c:Post) RETURN e.emotion,COUNT(e.emotion)
  // contribution distributions over every `emotion` property value for all posts created by one user (advanced - "how do others react to my contributions?")
  // MATCH (u:User)-[e:EMOTED]->(c:Post)<-[w:WROTE]-(a:User{id:"5a663b1ac64291000bf302a1"}) RETURN e.emotion,COUNT(e.emotion)
  // if we can filter the above an a variable timescale that would be great (should be possible on createdAt and updatedAt fields)
*/