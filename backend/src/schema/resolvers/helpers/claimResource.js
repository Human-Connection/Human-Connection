export async function queryReviewedByModerator(label, parent, context) {
  if (typeof parent.reviewedByModerator !== 'undefined') return parent.reviewedByModerator
  const { id } = parent
  const statement = `
    MATCH (resource {id: $id})<-[:FLAGGED]-(caseFolder:CaseFolder)<-[review:REVIEWED]-(moderator:User)
    WHERE $label IN labels(resource)
    RETURN moderator
    ORDER BY caseFolder.updatedAt DESC, review.updatedAt DESC
    LIMIT 1
  `
  let reviewedByModerator
  const session = context.driver.session()
  try {
    const result = await session.run(statement, { label, id })
    const [firstElement] = result.records.map(r => r.get('moderator').properties)
    reviewedByModerator = firstElement 
  } finally {
    session.close()
  }
  return reviewedByModerator
}
