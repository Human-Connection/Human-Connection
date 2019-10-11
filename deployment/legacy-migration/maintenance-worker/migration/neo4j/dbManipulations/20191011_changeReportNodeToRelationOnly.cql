MATCH (submitter:User)-[:REPORTED]->(report:Report)-[:REPORTED]->(resource)
DETACH DELETE report
CREATE (submitter)-[reported:REPORTED]->(resource)
SET reported.createdAt = toString(datetime())
SET reported.reasonCategory = 'other'
SET reported.reasonDescription = '!!! Created automatically to ensure database consistency! Date-time is this creation date and time.'
RETURN reported