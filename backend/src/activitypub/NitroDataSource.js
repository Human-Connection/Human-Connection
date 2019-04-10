import {
  throwErrorIfApolloErrorOccurred,
  extractIdFromActivityId,
  extractNameFromId,
  constructIdFromName
} from './utils'
import {
  createOrderedCollection,
  createOrderedCollectionPage
} from './utils/collection'
import {
  createArticleObject,
  isPublicAddressed
} from './utils/activity'
import { generateRsaKeyPair } from './security'
import gql from 'graphql-tag'
import { createHttpLink } from 'apollo-link-http'
import { setContext } from 'apollo-link-context'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { ApolloClient } from 'apollo-client'
import fetch from 'node-fetch'
import trunc from 'trunc-html'
import { getDriver } from '../bootstrap/neo4j'
import uuid from 'uuid/v4'
const debug = require('debug')('ea:nitro-datasource')

export default NitroDataSource

function NitroDataSource(uri) {
  this.uri = uri
  this.driver = getDriver()
  const defaultOptions = {
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all'
    }
  }
  const link = createHttpLink({ uri: this.uri, fetch: fetch }) // eslint-disable-line
  const cache = new InMemoryCache()
  const authLink = setContext(async (_, { headers }) => {
    // generate the authentication token (maybe from env? Which user?)
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJuYW1lIjoiUGV0ZXIgTHVzdGlnIiwiYXZhdGFyIjoiaHR0cHM6Ly9zMy5hbWF6b25hd3MuY29tL3VpZmFjZXMvZmFjZXMvdHdpdHRlci9qb2huY2FmYXp6YS8xMjguanBnIiwiaWQiOiJ1MSIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5vcmciLCJzbHVnIjoicGV0ZXItbHVzdGlnIiwiaWF0IjoxNTUyNDIwMTExLCJleHAiOjE2Mzg4MjAxMTEsImF1ZCI6Imh0dHA6Ly9sb2NhbGhvc3Q6MzAwMCIsImlzcyI6Imh0dHA6Ly9sb2NhbGhvc3Q6NDAwMCIsInN1YiI6InUxIn0.G7An1yeQUViJs-0Qj-Tc-zm0WrLCMB3M02pfPnm6xzw'
    // return the headers to the context so httpLink can read them
    return {
      headers: {
        ...headers,
        Authorization: token ? `Bearer ${token}` : ''
      }
    }
  })

  this.client = new ApolloClient({
    link: authLink.concat(link),
    cache: cache,
    defaultOptions
  })

  this.getFollowersCollection = async (actorId) => {
    const slug = extractNameFromId(actorId)
    debug(`slug= ${slug}`)
    const result = await this.client.query({
      query: gql`
          query {
              User(slug: "${slug}") {
                  followedByCount
              }
          }
      `
    })
    debug('successfully fetched followers')
    debug(result.data)
    if (result.data) {
      const actor = result.data.User[0]
      const followersCount = actor.followedByCount

      const followersCollection = createOrderedCollection(slug, 'followers')
      followersCollection.totalItems = followersCount

      return followersCollection
    } else {
      throwErrorIfApolloErrorOccurred(result)
    }
  }

  this.getFollowersCollectionPage = async (actorId) => {
    const slug = extractNameFromId(actorId)
    debug(`getFollowersPage slug = ${slug}`)
    const result = await this.client.query({
      query: gql`
          query {
              User(slug:"${slug}") {
                  followedBy {
                      slug
                  }
                  followedByCount
              }
          }
      `
    })

    debug(result.data)
    if (result.data) {
      const actor = result.data.User[0]
      const followers = actor.followedBy
      const followersCount = actor.followedByCount

      const followersCollection = createOrderedCollectionPage(slug, 'followers')
      followersCollection.totalItems = followersCount
      debug(`followers = ${JSON.stringify(followers, null, 2)}`)
      await Promise.all(
        followers.map(async (follower) => {
          followersCollection.orderedItems.push(constructIdFromName(follower.slug))
        })
      )

      return followersCollection
    } else {
      throwErrorIfApolloErrorOccurred(result)
    }
  }

  this.getFollowingCollection = async (actorId) => {
    const slug = extractNameFromId(actorId)
    const result = await this.client.query({
      query: gql`
          query {
              User(slug:"${slug}") {
                  followingCount
              }
          }
      `
    })

    debug(result.data)
    if (result.data) {
      const actor = result.data.User[0]
      const followingCount = actor.followingCount

      const followingCollection = createOrderedCollection(slug, 'following')
      followingCollection.totalItems = followingCount

      return followingCollection
    } else {
      throwErrorIfApolloErrorOccurred(result)
    }
  }

  this.getFollowingCollectionPage = async (actorId) => {
    const slug = extractNameFromId(actorId)
    const result = await this.client.query({
      query: gql`
          query {
              User(slug:"${slug}") {
                  following {
                      slug
                  }
                  followingCount
              }
          }
      `
    })

    debug(result.data)
    if (result.data) {
      const actor = result.data.User[0]
      const following = actor.following
      const followingCount = actor.followingCount

      const followingCollection = createOrderedCollectionPage(slug, 'following')
      followingCollection.totalItems = followingCount

      await Promise.all(
        following.map(async (user) => {
          followingCollection.orderedItems.push(await constructIdFromName(user.slug))
        })
      )

      return followingCollection
    } else {
      throwErrorIfApolloErrorOccurred(result)
    }
  }

  this.getOutboxCollection = async (actorId) => {
    const slug = extractNameFromId(actorId)
    const result = await this.client.query({
      query: gql`
          query {
              User(slug:"${slug}") {
                  contributions {
                      title
                      slug
                      content
                      contentExcerpt
                      createdAt
                  }
              }
          }
      `
    })

    debug(result.data)
    if (result.data) {
      const actor = result.data.User[0]
      const posts = actor.contributions

      const outboxCollection = createOrderedCollection(slug, 'outbox')
      outboxCollection.totalItems = posts.length

      return outboxCollection
    } else {
      throwErrorIfApolloErrorOccurred(result)
    }
  }

  this.getOutboxCollectionPage = async (actorId) => {
    const slug = extractNameFromId(actorId)
    debug(`inside getting outbox collection page => ${slug}`)
    const result = await this.client.query({
      query: gql`
          query {
              User(slug:"${slug}") {
                  actorId
                  slug
                  contributions {
                      id
                      activityId
                      objectId
                      title
                      slug
                      content
                      contentExcerpt
                      createdAt
                  }
              }
          }
      `
    })

    debug(result.data)
    if (result.data) {
      const actor = result.data.User[0]
      const posts = actor.contributions

      const outboxCollection = createOrderedCollectionPage(slug, 'outbox')
      outboxCollection.totalItems = posts.length
      await Promise.all(
        posts.map(async (post) => {
          outboxCollection.orderedItems.push(await createArticleObject(post.activityId, post.objectId, post.content, actor.slug, post.id, post.createdAt))
        })
      )

      debug('after createNote')
      return outboxCollection
    } else {
      throwErrorIfApolloErrorOccurred(result)
    }
  }

  this.undoFollowActivity = async (fromActorId, toActorId) => {
    const fromUserId = await ensureUser(fromActorId)
    const toUserId = await ensureUser(toActorId)
    const result = await this.client.mutate({
      mutation: gql`
          mutation {
              RemoveUserFollowedBy(from: {id: "${fromUserId}"}, to: {id: "${toUserId}"}) {
                  from { name }
              }
          }
      `
    })
    debug(`undoFollowActivity result = ${JSON.stringify(result, null, 2)}`)
    throwErrorIfApolloErrorOccurred(result)
  }

  this.saveFollowersCollectionPage = async (followersCollection, onlyNewestItem = true) => {
    debug('inside saveFollowers')
    let orderedItems = followersCollection.orderedItems
    const toUserName = extractNameFromId(followersCollection.id)
    const toUserId = await ensureUser(constructIdFromName(toUserName))
    orderedItems = onlyNewestItem ? [orderedItems.pop()] : orderedItems

    return Promise.all(
      orderedItems.map(async (follower) => {
        debug(`follower = ${follower}`)
        const fromUserId = await this.ensureUser(follower)
        debug(`fromUserId = ${fromUserId}`)
        debug(`toUserId = ${toUserId}`)
        const result = await this.client.mutate({
          mutation: gql`
              mutation {
                  AddUserFollowedBy(from: {id: "${fromUserId}"}, to: {id: "${toUserId}"}) {
                      from { name }
                  }
              }
          `
        })
        debug(`addUserFollowedBy edge = ${JSON.stringify(result, null, 2)}`)
        throwErrorIfApolloErrorOccurred(result)
        debug('saveFollowers: added follow edge successfully')
      })
    )
  }

  this.saveFollowingCollectionPage = async (followingCollection, onlyNewestItem = true) => {
    debug('inside saveFollowers')
    let orderedItems = followingCollection.orderedItems
    const fromUserName = extractNameFromId(followingCollection.id)
    const fromUserId = await ensureUser(constructIdFromName(fromUserName))
    orderedItems = onlyNewestItem ? [orderedItems.pop()] : orderedItems
    return Promise.all(
      orderedItems.map(async (following) => {
        debug(`follower = ${following}`)
        const toUserId = await this.ensureUser(following)
        debug(`fromUserId = ${fromUserId}`)
        debug(`toUserId = ${toUserId}`)
        const result = await this.client.mutate({
          mutation: gql`
              mutation {
                  AddUserFollowing(from: {id: "${fromUserId}"}, to: {id: "${toUserId}"}) {
                      from { name }
                  }
              }
          `
        })
        debug(`addUserFollowing edge = ${JSON.stringify(result, null, 2)}`)
        throwErrorIfApolloErrorOccurred(result)
        debug('saveFollowing: added follow edge successfully')
      })
    )
  }

  this.createPost = async (activity) => {
    // TODO how to handle the to field? Now the post is just created, doesn't matter who is the recipient
    // createPost
    const postObject = activity.object
    if (!isPublicAddressed(postObject)) {
      return debug('createPost: not send to public (sending to specific persons is not implemented yet)')
    }
    const title = postObject.summary ? postObject.summary : postObject.content.split(' ').slice(0, 5).join(' ')
    const postId = extractIdFromActivityId(postObject.id)
    debug('inside create post')
    let result = await this.client.mutate({
      mutation: gql`
          mutation {
              CreatePost(content: "${postObject.content}", contentExcerpt: "${trunc(postObject.content, 120)}", title: "${title}", id: "${postId}", objectId: "${postObject.id}", activityId: "${activity.id}") {
                  id
              }
          }
      `
    })

    throwErrorIfApolloErrorOccurred(result)

    // ensure user and add author to post
    const userId = await ensureUser(postObject.attributedTo)
    debug(`userId = ${userId}`)
    debug(`postId = ${postId}`)
    result = await this.client.mutate({
      mutation: gql`
          mutation {
              AddPostAuthor(from: {id: "${userId}"}, to: {id: "${postId}"}) {
                  from {
                      name
                  }
              }
          }
      `
    })

    throwErrorIfApolloErrorOccurred(result)
  }

  this.deletePost = async (activity) => {
    const result = await this.client.mutate({
      mutation: gql`
          mutation {
              DeletePost(id: "${extractIdFromActivityId(activity.object.id)}") {
                  title
              }
          }
      `
    })
    throwErrorIfApolloErrorOccurred(result)
  }

  this.updatePost = async (activity) => {
    const postObject = activity.object
    const postId = extractIdFromActivityId(postObject.id)
    const date = postObject.updated ? postObject.updated : new Date().toISOString()
    const result = await this.client.mutate({
      mutation: gql`
          mutation {
              UpdatePost(content: "${postObject.content}", contentExcerpt: "${trunc(postObject.content, 120).html}", id: "${postId}", updatedAt: "${date}") {
                  title
              }
          }
      `
    })
    throwErrorIfApolloErrorOccurred(result)
  }

  this.createShouted = async (activity) => {
    const userId = await ensureUser(activity.actor)
    const postId = extractIdFromActivityId(activity.object)
    const result = await this.client.mutate({
      mutation: gql`
          mutation {
              AddUserShouted(from: {id: "${userId}"}, to: {id: "${postId}"}) {
                  from {
                      name
                  }
              }
          }
      `
    })
    throwErrorIfApolloErrorOccurred(result)
    if (!result.data.AddUserShouted) {
      debug('something went wrong shouting post')
      throw Error('User or Post not exists')
    }
  }

  this.deleteShouted = async (activity) => {
    const userId = await ensureUser(activity.actor)
    const postId = extractIdFromActivityId(activity.object)
    const result = await this.client.mutate({
      mutation: gql`
          mutation {
              RemoveUserShouted(from: {id: "${userId}"}, to: {id: "${postId}"}) {
                  from {
                      name
                  }
              }
          }
      `
    })
    throwErrorIfApolloErrorOccurred(result)
    if (!result.data.RemoveUserShouted) {
      debug('something went wrong disliking a post')
      throw Error('User or Post not exists')
    }
  }

  this.getSharedInboxEndpoints = async () => {
    const result = await this.client.query({
      query: gql`
          query {
              SharedInboxEndpoint {
                  uri
              }
          }
      `
    })
    throwErrorIfApolloErrorOccurred(result)
    return result.data.SharedInboxEnpoint
  }

  this.addSharedInboxEndpoint = async (uri) => {
    try {
      const result = await this.client.mutate({
        mutation: gql`
            mutation {
                CreateSharedInboxEndpoint(uri: "${uri}")
            }
        `
      })
      throwErrorIfApolloErrorOccurred(result)
      return true
    } catch (e) {
      return false
    }
  }

  this.createComment = async (activity) => {
    const postObject = activity.object
    let result = await this.client.mutate({
      mutation: gql`
          mutation {
              CreateComment(content: "${postObject.content}", activityId: "${extractIdFromActivityId(activity.id)}") {
                  id
              }
          }
      `
    })
    throwErrorIfApolloErrorOccurred(result)

    const toUserId = await ensureUser(activity.actor)
    result = await this.client.mutate({
      mutation: gql`
          mutation {
              AddCommentAuthor(from: {id: "${result.data.CreateComment.id}"}, to: {id: "${toUserId}"}) {
                  id
              }
          }
      `
    })
    throwErrorIfApolloErrorOccurred(result)

    const postId = extractIdFromActivityId(postObject.inReplyTo)
    result = await this.client.mutate({
      mutation: gql`
          mutation {
              AddCommentPost(from: { id: "${result.data.CreateComment.id}", to: { id: "${postId}" }}) {
                  id
              }
          }
      `
    })

    throwErrorIfApolloErrorOccurred(result)
  }

  this.getActorId = async (name) => {
    const result = await this.client.query({
      query: gql`
          query {
              User(slug: "${name}") {
                  actorId
              }
          }
      `
    })
    throwErrorIfApolloErrorOccurred(result)
    if (Array.isArray(result.data.User) && result.data.User[0]) {
      return result.data.User[0].actorId
    } else {
      throw Error(`No user with name: ${name}`)
    }
  }

  this.getPublicKey = async (name) => {
    const result = await this.client.query({
      query: gql`
          query {
              User(slug: "${name}") {
                  publicKey
              }
          }
      `
    })
    throwErrorIfApolloErrorOccurred(result)
    if (result.data.User.length > 0) {
      return result.data.User[0].publicKey
    } else {
      throw Error(`No user with slug: ${name}`)
    }
  }

  this.getEncryptedPrivateKey = async (name) => {
    const session = this.driver.session()
    const result = await session.run('MATCH (u:User) WHERE u.slug = { slug } RETURN u.privateKey',
      {slug: name}).catch(() => { session.close() })
    session.close()
    if (result.records.length === 0) {
      throw Error(`No user with slug: ${name}`)
    } else {
      return result.records[0].get('u.privateKey')
    }
  }

  this.userExists = async (name) => {
    const result = await this.client.query({
      query: gql`
          query {
              User(slug: "${name}") {
                  slug
              }
          }
      `
    })

    if (result.data.User.length > 0) {
      return true
    } else {
      return false
    }
  }

  /**
   * This function will search for user existence and will create a disabled user with a random 16 bytes password when no user is found.
   *
   * @param actorId
   * @returns {Promise<*>}
   */
  async function ensureUser (actorId) {
    debug(`inside ensureUser = ${actorId}`)
    const session = this.driver.session()
    const name = extractNameFromId(actorId)
    const uniqueSlug = (actorId, name) => {
      const { hostname } = new URL(actorId)
      return `${hostname}-${name}`
    }
    let result = await session.run('MATCH (u:User) WHERE u.slug = { slug } RETURN u.id',
      { slug: uniqueSlug(actorId, name) }).catch(() => { session.close() })

    if (result.records.length > 0) {
      debug('ensureUser: user exists.. return id')
      // user already exists.. return the id
      return result.records[0].get('u.id')
    } else {
      debug('ensureUser: user not exists.. createUser')
      // user does not exist.. create it
      const keyPair = generateRsaKeyPair()
      const slug = uniqueSlug(actorId, name)
      result = await session.run('CREATE (u:User {slug: { slug }, id: { id }, name: { name }, actorId: { actorId },' +
        ' publicKey: { publicKey }, privateKey: { privateKey }}) RETURN u',
        { slug: slug, id: uuid(), name: name, actorId: actorId, publicKey: keyPair.publicKey, privateKey: keyPair.privateKey })
        .catch(() => { session.close() })
    }

    return result.records[0].get('u').properties.id
  }

  return this
}
