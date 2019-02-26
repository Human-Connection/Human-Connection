import {
  throwErrorIfGraphQLErrorOccurred,
  extractIdFromActivityId,
  createOrderedCollection,
  createOrderedCollectionPage,
  extractNameFromId,
  createArticleActivity,
  constructIdFromName
} from './utils'
import crypto from 'crypto'
import gql from 'graphql-tag'
import { createHttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import fetch from 'node-fetch'
import { ApolloClient } from 'apollo-client'
import dotenv from 'dotenv'
const debug = require('debug')('ea:nitro-datasource')

dotenv.config()

export default class NitroDatasource {
  constructor (domain) {
    this.domain = domain
    const defaultOptions = {
      query: {
        fetchPolicy: 'network-only',
        errorPolicy: 'all'
      }
    }
    const link = createHttpLink({ uri: process.env.GRAPHQL_URI, fetch: fetch }) // eslint-disable-line
    const cache = new InMemoryCache()
    this.client = new ApolloClient({
      link: link,
      cache: cache,
      defaultOptions
    })
  }

  async getFollowersCollection (actorId) {
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
      throwErrorIfGraphQLErrorOccurred(result)
    }
  }

  async getFollowersCollectionPage (actorId) {
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
      throwErrorIfGraphQLErrorOccurred(result)
    }
  }

  async getFollowingCollection (actorId) {
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
      throwErrorIfGraphQLErrorOccurred(result)
    }
  }

  async getFollowingCollectionPage (actorId) {
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
      throwErrorIfGraphQLErrorOccurred(result)
    }
  }

  async getOutboxCollection (actorId) {
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
      throwErrorIfGraphQLErrorOccurred(result)
    }
  }

  async getOutboxCollectionPage (actorId) {
    const slug = extractNameFromId(actorId)
    const result = await this.client.query({
      query: gql`
          query {
              User(slug:"${slug}") {
                  contributions {
                      id
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
        posts.map((post) => {
          outboxCollection.orderedItems.push(createArticleActivity(post.content, slug, post.id, post.createdAt))
        })
      )

      debug('after createNote')
      return outboxCollection
    } else {
      throwErrorIfGraphQLErrorOccurred(result)
    }
  }

  async undoFollowActivity (fromActorId, toActorId) {
    const fromUserId = await this.ensureUser(fromActorId)
    const toUserId = await this.ensureUser(toActorId)
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
    throwErrorIfGraphQLErrorOccurred(result)
  }

  async saveFollowersCollectionPage (followersCollection, onlyNewestItem = true) {
    debug('inside saveFollowers')
    let orderedItems = followersCollection.orderedItems
    const toUserName = extractNameFromId(followersCollection.id)
    const toUserId = await this.ensureUser(constructIdFromName(toUserName))
    orderedItems = onlyNewestItem ? [orderedItems.pop()] : orderedItems

    return Promise.all(
      await Promise.all(orderedItems.map(async (follower) => {
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
        throwErrorIfGraphQLErrorOccurred(result)
        debug('saveFollowers: added follow edge successfully')
      }))
    )
  }

  async createPost (activity) {
    // TODO how to handle the to field? Now the post is just created, doesn't matter who is the recipient
    // createPost
    const postObject = activity.object
    const title = postObject.summary ? postObject.summary : postObject.content.split(' ').slice(0, 5).join(' ')
    const postId = extractIdFromActivityId(postObject.id)
    const activityId = extractIdFromActivityId(activity.id)
    let result = await this.client.mutate({
      mutation: gql`
          mutation {
              CreatePost(content: "${postObject.content}", title: "${title}", id: "${postId}", activityId: "${activityId}") {
                  id
              }
          }
      `
    })

    throwErrorIfGraphQLErrorOccurred(result)

    // ensure user and add author to post
    const userId = await this.ensureUser(postObject.attributedTo)
    result = await this.client.mutate({
      mutation: gql`
          mutation {
              AddPostAuthor(from: {id: "${userId}"}, to: {id: "${postId}"})
          }
      `
    })

    throwErrorIfGraphQLErrorOccurred(result)
  }

  async getSharedInboxEndpoints () {
    const result = await this.client.query({
      query: gql`
        query {
            SharedInboxEndpoint {
                uri
            }
        }
      `
    })
    throwErrorIfGraphQLErrorOccurred(result)
    return result.data.SharedInboxEnpoint
  }
  async addSharedInboxEndpoint (uri) {
    try {
      const result = await this.client.mutate({
        mutation: gql`
            mutation {
                CreateSharedInboxEndpoint(uri: "${uri}")
            }
        `
      })
      throwErrorIfGraphQLErrorOccurred(result)
      return true
    } catch (e) {
      return false
    }
  }

  async createComment (activity) {
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

    throwErrorIfGraphQLErrorOccurred(result)
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

    throwErrorIfGraphQLErrorOccurred(result)
  }

  /**
   * This function will search for user existence and will create a disabled user with a random 16 bytes password when no user is found.
   *
   * @param actorId
   * @returns {Promise<*>}
   */
  async ensureUser (actorId) {
    debug(`inside ensureUser = ${actorId}`)
    const queryResult = await this.client.query({
      query: gql`
          query {
              User(slug: "${extractNameFromId(actorId)}") {
                  id
              }
          }
      `
    })

    if (queryResult.data && Array.isArray(queryResult.data.User) && queryResult.data.User.length > 0) {
      debug('ensureUser: user exists.. return id')
      // user already exists.. return the id
      return queryResult.data.User[0].id
    } else {
      debug('ensureUser: user not exists.. createUser')
      // user does not exist.. create it
      const result = await this.client.mutate({
        mutation: gql`
            mutation {
                CreateUser(password: "${crypto.randomBytes(16).toString('hex')}", slug:"${extractNameFromId(actorId)}", actorId: "${actorId}", name: "${extractNameFromId(actorId)}") {
                    id
                }
            }
        `
      })
      throwErrorIfGraphQLErrorOccurred(result)

      return result.data.CreateUser.id
    }
  }
}
