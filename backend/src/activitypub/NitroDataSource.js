import {
  throwErrorIfApolloErrorOccurred,
  extractIdFromActivityId,
  extractNameFromId,
  constructIdFromName,
} from './utils'
import { createOrderedCollection, createOrderedCollectionPage } from './utils/collection'
import { createArticleObject, isPublicAddressed } from './utils/activity'
import crypto from 'crypto'
import gql from 'graphql-tag'
import { createHttpLink } from 'apollo-link-http'
import { setContext } from 'apollo-link-context'
import { InMemoryCache } from 'apollo-cache-inmemory'
import fetch from 'node-fetch'
import { ApolloClient } from 'apollo-client'
import trunc from 'trunc-html'
const debug = require('debug')('ea:nitro-datasource')

export default class NitroDataSource {
  constructor(uri) {
    this.uri = uri
    const defaultOptions = {
      query: {
        fetchPolicy: 'network-only',
        errorPolicy: 'all',
      },
    }
    const link = createHttpLink({ uri: this.uri, fetch: fetch }) // eslint-disable-line
    const cache = new InMemoryCache()
    const authLink = setContext((_, { headers }) => {
      // generate the authentication token (maybe from env? Which user?)
      const token =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJuYW1lIjoiUGV0ZXIgTHVzdGlnIiwiYXZhdGFyIjoiaHR0cHM6Ly9zMy5hbWF6b25hd3MuY29tL3VpZmFjZXMvZmFjZXMvdHdpdHRlci9qb2huY2FmYXp6YS8xMjguanBnIiwiaWQiOiJ1MSIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5vcmciLCJzbHVnIjoicGV0ZXItbHVzdGlnIiwiaWF0IjoxNTUyNDIwMTExLCJleHAiOjE2Mzg4MjAxMTEsImF1ZCI6Imh0dHA6Ly9sb2NhbGhvc3Q6MzAwMCIsImlzcyI6Imh0dHA6Ly9sb2NhbGhvc3Q6NDAwMCIsInN1YiI6InUxIn0.G7An1yeQUViJs-0Qj-Tc-zm0WrLCMB3M02pfPnm6xzw'
      // return the headers to the context so httpLink can read them
      return {
        headers: {
          ...headers,
          Authorization: token ? `Bearer ${token}` : '',
        },
      }
    })
    this.client = new ApolloClient({
      link: authLink.concat(link),
      cache: cache,
      defaultOptions,
    })
  }

  async getFollowersCollection(actorId) {
    const slug = extractNameFromId(actorId)
    debug(`slug= ${slug}`)
    const result = await this.client.query({
      query: gql`
          query {
              User(slug: "${slug}") {
                  followedByCount
              }
          }
      `,
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

  async getFollowersCollectionPage(actorId) {
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
      `,
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
        followers.map(async follower => {
          followersCollection.orderedItems.push(constructIdFromName(follower.slug))
        }),
      )

      return followersCollection
    } else {
      throwErrorIfApolloErrorOccurred(result)
    }
  }

  async getFollowingCollection(actorId) {
    const slug = extractNameFromId(actorId)
    const result = await this.client.query({
      query: gql`
          query {
              User(slug:"${slug}") {
                  followingCount
              }
          }
      `,
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

  async getFollowingCollectionPage(actorId) {
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
      `,
    })

    debug(result.data)
    if (result.data) {
      const actor = result.data.User[0]
      const following = actor.following
      const followingCount = actor.followingCount

      const followingCollection = createOrderedCollectionPage(slug, 'following')
      followingCollection.totalItems = followingCount

      await Promise.all(
        following.map(async user => {
          followingCollection.orderedItems.push(await constructIdFromName(user.slug))
        }),
      )

      return followingCollection
    } else {
      throwErrorIfApolloErrorOccurred(result)
    }
  }

  async getOutboxCollection(actorId) {
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
      `,
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

  async getOutboxCollectionPage(actorId) {
    const slug = extractNameFromId(actorId)
    debug(`inside getting outbox collection page => ${slug}`)
    const result = await this.client.query({
      query: gql`
          query {
              User(slug:"${slug}") {
                  actorId
                  contributions {
                      id
                      activityId
                      objectId
                      title
                      slug
                      content
                      contentExcerpt
                      createdAt
                      author {
                          slug
                      }
                  }
              }
          }
      `,
    })

    debug(result.data)
    if (result.data) {
      const actor = result.data.User[0]
      const posts = actor.contributions

      const outboxCollection = createOrderedCollectionPage(slug, 'outbox')
      outboxCollection.totalItems = posts.length
      await Promise.all(
        posts.map(async post => {
          outboxCollection.orderedItems.push(
            await createArticleObject(
              post.activityId,
              post.objectId,
              post.content,
              post.author.slug,
              post.id,
              post.createdAt,
            ),
          )
        }),
      )

      debug('after createNote')
      return outboxCollection
    } else {
      throwErrorIfApolloErrorOccurred(result)
    }
  }

  async undoFollowActivity(fromActorId, toActorId) {
    const fromUserId = await this.ensureUser(fromActorId)
    const toUserId = await this.ensureUser(toActorId)
    const result = await this.client.mutate({
      mutation: gql`
          mutation {
              RemoveUserFollowedBy(from: {id: "${fromUserId}"}, to: {id: "${toUserId}"}) {
                  from { name }
              }
          }
      `,
    })
    debug(`undoFollowActivity result = ${JSON.stringify(result, null, 2)}`)
    throwErrorIfApolloErrorOccurred(result)
  }

  async saveFollowersCollectionPage(followersCollection, onlyNewestItem = true) {
    debug('inside saveFollowers')
    let orderedItems = followersCollection.orderedItems
    const toUserName = extractNameFromId(followersCollection.id)
    const toUserId = await this.ensureUser(constructIdFromName(toUserName))
    orderedItems = onlyNewestItem ? [orderedItems.pop()] : orderedItems

    return Promise.all(
      orderedItems.map(async follower => {
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
          `,
        })
        debug(`addUserFollowedBy edge = ${JSON.stringify(result, null, 2)}`)
        throwErrorIfApolloErrorOccurred(result)
        debug('saveFollowers: added follow edge successfully')
      }),
    )
  }
  async saveFollowingCollectionPage(followingCollection, onlyNewestItem = true) {
    debug('inside saveFollowers')
    let orderedItems = followingCollection.orderedItems
    const fromUserName = extractNameFromId(followingCollection.id)
    const fromUserId = await this.ensureUser(constructIdFromName(fromUserName))
    orderedItems = onlyNewestItem ? [orderedItems.pop()] : orderedItems
    return Promise.all(
      orderedItems.map(async following => {
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
          `,
        })
        debug(`addUserFollowing edge = ${JSON.stringify(result, null, 2)}`)
        throwErrorIfApolloErrorOccurred(result)
        debug('saveFollowing: added follow edge successfully')
      }),
    )
  }

  async createPost(activity) {
    // TODO how to handle the to field? Now the post is just created, doesn't matter who is the recipient
    // createPost
    const postObject = activity.object
    if (!isPublicAddressed(postObject)) {
      return debug(
        'createPost: not send to public (sending to specific persons is not implemented yet)',
      )
    }
    const title = postObject.summary
      ? postObject.summary
      : postObject.content
          .split(' ')
          .slice(0, 5)
          .join(' ')
    const postId = extractIdFromActivityId(postObject.id)
    debug('inside create post')
    let result = await this.client.mutate({
      mutation: gql`
          mutation {
              CreatePost(content: "${postObject.content}", contentExcerpt: "${trunc(
        postObject.content,
        120,
      )}", title: "${title}", id: "${postId}", objectId: "${postObject.id}", activityId: "${
        activity.id
      }") {
                  id
              }
          }
      `,
    })

    throwErrorIfApolloErrorOccurred(result)

    // ensure user and add author to post
    const userId = await this.ensureUser(postObject.attributedTo)
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
      `,
    })

    throwErrorIfApolloErrorOccurred(result)
  }

  async deletePost(activity) {
    const result = await this.client.mutate({
      mutation: gql`
        mutation {
            DeletePost(id: "${extractIdFromActivityId(activity.object.id)}") {
                title
            }
        }
      `,
    })
    throwErrorIfApolloErrorOccurred(result)
  }

  async updatePost(activity) {
    const postObject = activity.object
    const postId = extractIdFromActivityId(postObject.id)
    const date = postObject.updated ? postObject.updated : new Date().toISOString()
    const result = await this.client.mutate({
      mutation: gql`
        mutation {
            UpdatePost(content: "${postObject.content}", contentExcerpt: "${
        trunc(postObject.content, 120).html
      }", id: "${postId}", updatedAt: "${date}") {
                title
            }
        }
      `,
    })
    throwErrorIfApolloErrorOccurred(result)
  }

  async createShouted(activity) {
    const userId = await this.ensureUser(activity.actor)
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
      `,
    })
    throwErrorIfApolloErrorOccurred(result)
    if (!result.data.AddUserShouted) {
      debug('something went wrong shouting post')
      throw Error('User or Post not exists')
    }
  }

  async deleteShouted(activity) {
    const userId = await this.ensureUser(activity.actor)
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
      `,
    })
    throwErrorIfApolloErrorOccurred(result)
    if (!result.data.AddUserShouted) {
      debug('something went wrong disliking a post')
      throw Error('User or Post not exists')
    }
  }

  async getSharedInboxEndpoints() {
    const result = await this.client.query({
      query: gql`
        query {
          SharedInboxEndpoint {
            uri
          }
        }
      `,
    })
    throwErrorIfApolloErrorOccurred(result)
    return result.data.SharedInboxEnpoint
  }
  async addSharedInboxEndpoint(uri) {
    try {
      const result = await this.client.mutate({
        mutation: gql`
            mutation {
                CreateSharedInboxEndpoint(uri: "${uri}")
            }
        `,
      })
      throwErrorIfApolloErrorOccurred(result)
      return true
    } catch (e) {
      return false
    }
  }

  async createComment(activity) {
    const postObject = activity.object
    let result = await this.client.mutate({
      mutation: gql`
          mutation {
              CreateComment(content: "${
                postObject.content
              }", activityId: "${extractIdFromActivityId(activity.id)}") {
                  id
              }
          }
      `,
    })
    throwErrorIfApolloErrorOccurred(result)

    const toUserId = await this.ensureUser(activity.actor)
    const result2 = await this.client.mutate({
      mutation: gql`
          mutation {
              AddCommentAuthor(from: {id: "${result.data.CreateComment.id}"}, to: {id: "${toUserId}"}) {
                  id
              }
          }
      `,
    })
    throwErrorIfApolloErrorOccurred(result2)

    const postId = extractIdFromActivityId(postObject.inReplyTo)
    result = await this.client.mutate({
      mutation: gql`
          mutation {
              AddCommentPost(from: { id: "${result.data.CreateComment.id}", to: { id: "${postId}" }}) {
                  id
              }
          }
      `,
    })

    throwErrorIfApolloErrorOccurred(result)
  }

  /**
   * This function will search for user existence and will create a disabled user with a random 16 bytes password when no user is found.
   *
   * @param actorId
   * @returns {Promise<*>}
   */
  async ensureUser(actorId) {
    debug(`inside ensureUser = ${actorId}`)
    const name = extractNameFromId(actorId)
    const queryResult = await this.client.query({
      query: gql`
          query {
              User(slug: "${name}") {
                  id
              }
          }
      `,
    })

    if (
      queryResult.data &&
      Array.isArray(queryResult.data.User) &&
      queryResult.data.User.length > 0
    ) {
      debug('ensureUser: user exists.. return id')
      // user already exists.. return the id
      return queryResult.data.User[0].id
    } else {
      debug('ensureUser: user not exists.. createUser')
      // user does not exist.. create it
      const pw = crypto.randomBytes(16).toString('hex')
      const slug = name
        .toLowerCase()
        .split(' ')
        .join('-')
      const result = await this.client.mutate({
        mutation: gql`
            mutation {
                CreateUser(password: "${pw}", slug:"${slug}", actorId: "${actorId}", name: "${name}", email: "${slug}@test.org") {
                    id
                }
            }
        `,
      })
      throwErrorIfApolloErrorOccurred(result)

      return result.data.CreateUser.id
    }
  }
}
