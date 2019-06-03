import { UserInputError } from 'apollo-server'

export default async function replaceParams(args, context) {
  const { author = 'all' } = args.filterBubble || {}
  const { user } = context

  if (author === 'followed') {
    if (!user)
      throw new UserInputError("You are unauthenticated - I don't know your followed users")

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
