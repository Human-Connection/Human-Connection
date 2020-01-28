import faker from 'faker'
import uuid from 'uuid/v4'
import { Factory } from 'rosie'
import { getNeode } from '../db/neo4j'

const neode = getNeode()

Factory.define('comment')
  .option('postId', null)
  .option('post', ['postId'], postId => {
    if (postId) return neode.find('Post', postId)
    return Factory.build('post')
  })
  .option('authorId', null)
  .option('author', ['authorId'], authorId => {
    if (authorId) return neode.find('User', authorId)
    return Factory.build('user')
  })
  .attrs({
    id: uuid,
    content: faker.lorem.sentence,
  })
  .attr('contentExcerpt', ['contentExcerpt', 'content'], (contentExcerpt, content) => {
    return contentExcerpt || content
  })
  .after(async (buildObject, options) => {
    const [comment, author, post] = await Promise.all([
      neode.create('Comment', buildObject),
      options.author,
      options.post,
    ])
    await Promise.all([comment.relateTo(author, 'author'), comment.relateTo(post, 'post')])
    return comment
  })

export default function create() {
  return {
    factory: async ({ args, options, neodeInstance, factoryInstance }) => {
      return Factory.build('comment', args, options)
    },
  }
}
