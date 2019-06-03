export default async function replaceParams(args, context) {
  const { author = 'all' } = args.filterBubble || {}

  if (author === 'followed') {
    const session = context.driver.session()
    let { records } = await session.run(
      'MATCH(followed:User)<-[:FOLLOWS]-(u {id: $userId}) RETURN followed.id',
      { userId: context.user.id },
    )
    const followedIds = records.map(record => record.get('followed.id'))

    // carefully override `id_in`
    args.filter = args.filter || {}
    args.filter.author = args.filter.author || {}
    args.filter.author.id_in = followedIds

    session.close()
  }

  delete args.filterBubble

  return args
}
