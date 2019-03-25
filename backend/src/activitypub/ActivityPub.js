import {
  extractNameFromId,
  extractDomainFromUrl,
  signAndSend
} from './utils'
import {
  isPublicAddressed,
  sendAcceptActivity,
  sendRejectActivity
} from './utils/activity'
import request from 'request'
import as from 'activitystrea.ms'
import NitroDataSource from './NitroDataSource'
import router from './routes'
import dotenv from 'dotenv'
import Collections from './Collections'
import uuid from 'uuid/v4'
const debug = require('debug')('ea')

let activityPub = null

export { activityPub }

export default class ActivityPub {

  constructor (activityPubEndpointUri, internalGraphQlUri) {
    this.endpoint = activityPubEndpointUri
    this.dataSource = new NitroDataSource(internalGraphQlUri)
    this.collections = new Collections(this.dataSource)
  }

  static init (server) {
    if (!activityPub) {
      dotenv.config()
      activityPub = new ActivityPub(process.env.CLIENT_URI || 'http://localhost:3000', process.env.GRAPHQL_URI || 'http://localhost:4000')

      // integrate into running graphql express server
      server.express.set('ap', activityPub)
      server.express.use(router)
      console.log('-> ActivityPub middleware added to the graphql express server')
    } else {
      console.log('-> ActivityPub middleware already added to the graphql express server')
    }
  }

  handleFollowActivity (activity) {
    debug(`inside FOLLOW ${activity.actor}`)
    let toActorName = extractNameFromId(activity.object)
    let fromDomain = extractDomainFromUrl(activity.actor)
    const dataSource = this.dataSource

    return new Promise((resolve, reject) => {
      request({
        url: activity.actor,
        headers: {
          'Accept': 'application/activity+json'
        }
      }, async (err, response, toActorObject) => {
        if (err) return reject(err)
        // save shared inbox
        toActorObject = JSON.parse(toActorObject)
        await this.dataSource.addSharedInboxEndpoint(toActorObject.endpoints.sharedInbox)

        let followersCollectionPage = await this.dataSource.getFollowersCollectionPage(activity.object)

        const followActivity = as.follow()
          .id(activity.id)
          .actor(activity.actor)
          .object(activity.object)

        // add follower if not already in collection
        if (followersCollectionPage.orderedItems.includes(activity.actor)) {
          debug('follower already in collection!')
          debug(`inbox = ${toActorObject.inbox}`)
          resolve(sendRejectActivity(followActivity, toActorName, fromDomain, toActorObject.inbox))
        } else {
          followersCollectionPage.orderedItems.push(activity.actor)
        }
        debug(`toActorObject = ${toActorObject}`)
        toActorObject = typeof toActorObject !== 'object' ? JSON.parse(toActorObject) : toActorObject
        debug(`followers = ${JSON.stringify(followersCollectionPage.orderedItems, null, 2)}`)
        debug(`inbox = ${toActorObject.inbox}`)
        debug(`outbox = ${toActorObject.outbox}`)
        debug(`followers = ${toActorObject.followers}`)
        debug(`following = ${toActorObject.following}`)

        try {
          await dataSource.saveFollowersCollectionPage(followersCollectionPage)
          debug('follow activity saved')
          resolve(sendAcceptActivity(followActivity, toActorName, fromDomain, toActorObject.inbox))
        } catch (e) {
          debug('followers update error!', e)
          resolve(sendRejectActivity(followActivity, toActorName, fromDomain, toActorObject.inbox))
        }
      })
    })
  }

  handleUndoActivity (activity) {
    debug('inside UNDO')
    switch (activity.object.type) {
    case 'Follow':
      const followActivity = activity.object
      return this.dataSource.undoFollowActivity(followActivity.actor, followActivity.object)
    case 'Like':
      return this.dataSource.deleteShouted(activity)
    default:
    }
  }

  handleCreateActivity (activity) {
    debug('inside create')
    switch (activity.object.type) {
    case 'Article':
    case 'Note':
      const articleObject = activity.object
      if (articleObject.inReplyTo) {
        return this.dataSource.createComment(activity)
      } else {
        return this.dataSource.createPost(activity)
      }
    default:
    }
  }

  handleDeleteActivity (activity) {
    debug('inside delete')
    switch (activity.object.type) {
    case 'Article':
    case 'Note':
      return this.dataSource.deletePost(activity)
    default:
    }
  }

  handleUpdateActivity (activity) {
    debug('inside update')
    switch (activity.object.type) {
    case 'Note':
    case 'Article':
      return this.dataSource.updatePost(activity)
    default:
    }
  }

  handleLikeActivity (activity) {
    // TODO differ if activity is an Article/Note/etc.
    return this.dataSource.createShouted(activity)
  }

  handleDislikeActivity (activity) {
    // TODO differ if activity is an Article/Note/etc.
    return this.dataSource.deleteShouted(activity)
  }

  async handleAcceptActivity (activity) {
    debug('inside accept')
    switch (activity.object.type) {
    case 'Follow':
      const followObject = activity.object
      const followingCollectionPage = await this.collections.getFollowingCollectionPage(followObject.actor)
      followingCollectionPage.orderedItems.push(followObject.object)
      await this.dataSource.saveFollowingCollectionPage(followingCollectionPage)
    }
  }

  getActorObject (url) {
    return new Promise((resolve, reject) => {
      request({
        url: url,
        headers: {
          'Accept': 'application/json'
        }
      }, (err, response, body) => {
        if (err) {
          reject(err)
        }
        resolve(JSON.parse(body))
      })
    })
  }

  generateStatusId (slug) {
    return `https://${this.host}/activitypub/users/${slug}/status/${uuid()}`
  }

  async sendActivity (activity) {
    delete activity.send
    const fromName = extractNameFromId(activity.actor)
    if (Array.isArray(activity.to) && isPublicAddressed(activity)) {
      debug('is public addressed')
      const sharedInboxEndpoints = await this.dataSource.getSharedInboxEndpoints()
      // serve shared inbox endpoints
      sharedInboxEndpoints.map((sharedInbox) => {
        return this.trySend(activity, fromName, new URL(sharedInbox).host, sharedInbox)
      })
      activity.to = activity.to.filter((recipient) => {
        return !(isPublicAddressed({ to: recipient }))
      })
      // serve the rest
      activity.to.map(async (recipient) => {
        debug('serve rest')
        const actorObject = await this.getActorObject(recipient)
        return this.trySend(activity, fromName, new URL(recipient).host, actorObject.inbox)
      })
    } else if (typeof activity.to === 'string') {
      debug('is string')
      const actorObject = await this.getActorObject(activity.to)
      return this.trySend(activity, fromName, new URL(activity.to).host, actorObject.inbox)
    } else if (Array.isArray(activity.to)) {
      activity.to.map(async (recipient) => {
        const actorObject = await this.getActorObject(recipient)
        return this.trySend(activity, fromName, new URL(recipient).host, actorObject.inbox)
      })
    }
  }
  async trySend (activity, fromName, host, url, tries = 5) {
    try {
      return await signAndSend(activity, fromName, host, url)
    } catch (e) {
      if (tries > 0) {
        setTimeout(function () {
          return this.trySend(activity, fromName, host, url, --tries)
        }, 20000)
      }
    }
  }
}
