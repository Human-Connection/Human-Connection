import {
  extractNameFromId,
  extractHostFromUrl,
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
import Collections from './Collections'
import uuid from 'uuid/v4'
import express from 'express'
import dotenv from 'dotenv'
const debug = require('debug')('ea')

let activityPub = null

export { activityPub }

export default function (server) {
  if (!activityPub) {
    activityPub = new ActivityPub()

    // integrate into running express server
    if (server) {
      server.express.set('ap', activityPub)
      server.express.use(router)
      console.log('-> ActivityPub middleware added to the express server')
      return
    }

    // start standalone express server
    dotenv.config()

    const app = express()
    app.set('ap', activityPub)
    app.use(router)
    app.listen(process.env.ACTIVITYPUB_PORT || 4010, () => {
      console.log(`ActivityPub express service listening on port ${process.env.ACTIVITYPUB_PORT || 4010}`)
    })
  } else {
    console.log('-> ActivityPub middleware already added to the express server')
  }
}

function ActivityPub () {
  this.endpoint = process.env.CLIENT_URI || 'http://localhost:3000'
  this.dataSource = new NitroDataSource(process.env.GRAPHQL_URI || 'http://localhost:4000')
  const dataSource = this.dataSource
  this.collections = new Collections(this.dataSource)

  this.handleFollowActivity = async (activity) => {
    debug(`inside FOLLOW ${activity.actor}`)
    let toActorName = extractNameFromId(activity.object)
    let fromDomain = extractHostFromUrl(activity.actor)

    const toActorObject = await this.getActorObject(activity.actor)
    await saveSharedInboxEndpoint(activity.actor, toActorObject)
    let followersCollectionPage = await this.dataSource.getFollowersCollectionPage(activity.object)

    const followActivity = as.follow()
      .id(activity.id)
      .actor(activity.actor)
      .object(activity.object)

    // add follower if not already in collection
    if (followersCollectionPage.orderedItems.includes(activity.actor)) {
      debug('follower already in collection!')
      return sendRejectActivity(followActivity, toActorName, fromDomain, toActorObject.inbox)
    } else {
      followersCollectionPage.orderedItems.push(activity.actor)
    }
    debug(`toActorObject = ${toActorObject}`)
    debug(`followers = ${JSON.stringify(followersCollectionPage.orderedItems, null, 2)}`)
    debug(`inbox = ${toActorObject.inbox}`)
    debug(`outbox = ${toActorObject.outbox}`)
    debug(`followers = ${toActorObject.followers}`)
    debug(`following = ${toActorObject.following}`)

    try {
      await this.dataSource.saveFollowersCollectionPage(followersCollectionPage)
      debug('follow activity saved')
      return sendAcceptActivity(followActivity, toActorName, fromDomain, toActorObject.inbox)
    } catch (e) {
      debug('followers update error!', e)
      return sendRejectActivity(followActivity, toActorName, fromDomain, toActorObject.inbox)
    }
  }

  this.handleUndoActivity = async (activity) => {
    debug('inside UNDO')
    switch (activity.object.type) {
    case 'Follow':
      const followActivity = activity.object
      return this.dataSource.undoFollowActivity(followActivity.actor, followActivity.object)
    case 'Like':
      return this.dataSource.deleteLike(activity)
    default:
    }
  }

  this.handleCreateActivity = async (activity) => {
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

  this.handleDeleteActivity = async (activity) => {
    debug('inside delete')
    switch (activity.object.type) {
    case 'Article':
    case 'Note':
      return this.dataSource.deletePost(activity)
    default:
    }
  }

  this.handleUpdateActivity = async (activity) => {
    debug('inside update')
    switch (activity.object.type) {
    case 'Note':
    case 'Article':
      return this.dataSource.updatePost(activity)
    default:
    }
  }

  this.handleLikeActivity = async (activity) => {
    // TODO differ if activity is an Article/Note/etc.
    return this.dataSource.createLike(activity)
  }

  this.handleDislikeActivity = async (activity) => {
    // TODO differ if activity is an Article/Note/etc.
    return this.dataSource.deleteLike(activity)
  }

  this.handleAcceptActivity = async (activity) => {
    switch (activity.object.type) {
    case 'Follow':
      const followObject = activity.object
      const followingCollectionPage = await this.collections.getFollowingCollectionPage(followObject.actor)
      followingCollectionPage.orderedItems.push(followObject.object)
      await this.dataSource.saveFollowingCollectionPage(followingCollectionPage)
    }
  }

  this.getActorObject = (actorId) => {
    return new Promise((resolve, reject) => {
      request({
        url: actorId,
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

  this.getActorId = (name) => {
    return this.dataSource.getActorId(name)
  }

  this.generateStatusId = (name) => {
    return `${this.endpoint}/api/users/${name}/status/${uuid()}`
  }

  this.userExists = (name) => {
    return this.dataSource.userExists(name)
  }

  this.getPublicKey = (name) => {
    return this.dataSource.getPublicKey(name)
  }

  this.sendActivity = async (activity) => {
    const fromName = extractNameFromId(activity.actor)

    if (Array.isArray(activity.to) && isPublicAddressed(activity)) {
      debug('is public addressed')
      const sharedInboxEndpoints = await this.dataSource.getSharedInboxEndpoints()
      // serve shared inbox endpoints
      sharedInboxEndpoints.forEach((sharedInbox) => {
        return trySend(activity, fromName, new URL(sharedInbox).hostname, sharedInbox)
      })
      activity.to = activity.to.filter((recipient) => {
        return !(isPublicAddressed({ to: recipient }))
      })
      // serve the rest
      activity.to.forEach(async (recipient) => {
        debug('serve rest')
        const actorObject = await this.getActorObject(recipient)
        return trySend(activity, fromName, new URL(recipient).hostname, actorObject.inbox)
      })
    } else if (typeof activity.to === 'string') {
      debug('is string')
      const actorObject = await this.getActorObject(activity.to)
      return trySend(activity, fromName, new URL(activity.to).hostname, actorObject.inbox)
    } else if (Array.isArray(activity.to)) {
      activity.to.forEach(async (recipient) => {
        const actorObject = await this.getActorObject(recipient)
        return trySend(activity, fromName, new URL(recipient).hostname, actorObject.inbox)
      })
    }
  }

  async function trySend (activity, fromName, toHostname, url, tries = 3) {
    if (tries === 0) {
      return
    }

    try {
      return await signAndSend(activity, fromName, toHostname, url)
    } catch (e) {
      setTimeout(function () {
        return trySend(activity, fromName, toHostname, url, --tries)
      }, 20000)
    }
  }

  async function saveSharedInboxEndpoint (actorId, actorObject = null) {
    if (!actorObject) {
      actorObject = await this.getActorObject(actorId)
    }
    if (actorObject.endpoints && actorObject.endpoints.sharedInbox) {
      await dataSource.addSharedInboxEndpoint(actorObject.endpoints.sharedInbox)
    }
  }

  return this
}
