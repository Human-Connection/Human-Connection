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
import Collections from './Collections'
import uuid from 'uuid/v4'
import express from 'express'
import dotenv from 'dotenv'

let activityPub = null

export { activityPub }

export default function init(server) {
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
  this.collections = new Collections(this.dataSource)
}

ActivityPub.prototype =  {
  handleFollowActivity (activity) {
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
          resolve(sendRejectActivity(followActivity, toActorName, fromDomain, toActorObject.inbox))
        } else {
          followersCollectionPage.orderedItems.push(activity.actor)
        }

        toActorObject = typeof toActorObject !== 'object' ? JSON.parse(toActorObject) : toActorObject

        try {
          await dataSource.saveFollowersCollectionPage(followersCollectionPage)
          resolve(sendAcceptActivity(followActivity, toActorName, fromDomain, toActorObject.inbox))
        } catch (e) {
          resolve(sendRejectActivity(followActivity, toActorName, fromDomain, toActorObject.inbox))
        }
      })
    })
  },

  handleUndoActivity (activity) {
    switch (activity.object.type) {
      case 'Follow':
        const followActivity = activity.object
        return this.dataSource.undoFollowActivity(followActivity.actor, followActivity.object)
      case 'Like':
        return this.dataSource.deleteShouted(activity)
      default:
    }
  },

  handleCreateActivity (activity) {
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
  },

  handleDeleteActivity (activity) {
    switch (activity.object.type) {
      case 'Article':
      case 'Note':
        return this.dataSource.deletePost(activity)
      default:
    }
  },

  handleUpdateActivity (activity) {
    switch (activity.object.type) {
      case 'Note':
      case 'Article':
        return this.dataSource.updatePost(activity)
      default:
    }
  },

  handleLikeActivity (activity) {
    // TODO differ if activity is an Article/Note/etc.
    return this.dataSource.createShouted(activity)
  },

  handleDislikeActivity (activity) {
    // TODO differ if activity is an Article/Note/etc.
    return this.dataSource.deleteShouted(activity)
  },

  async handleAcceptActivity (activity) {
    switch (activity.object.type) {
      case 'Follow':
        const followObject = activity.object
        const followingCollectionPage = await this.collections.getFollowingCollectionPage(followObject.actor)
        followingCollectionPage.orderedItems.push(followObject.object)
        await this.dataSource.saveFollowingCollectionPage(followingCollectionPage)
    }
  },

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
  },

  generateStatusId (slug) {
    return `${this.endpoint}/api/users/${slug}/status/${uuid()}`
  },

  async sendActivity (activity) {
    delete activity.send
    const fromName = extractNameFromId(activity.actor)
    if (Array.isArray(activity.to) && isPublicAddressed(activity)) {
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
        const actorObject = await this.getActorObject(recipient)
        return this.trySend(activity, fromName, new URL(recipient).host, actorObject.inbox)
      })
    } else if (typeof activity.to === 'string') {
      const actorObject = await this.getActorObject(activity.to)
      return this.trySend(activity, fromName, new URL(activity.to).host, actorObject.inbox)
    } else if (Array.isArray(activity.to)) {
      activity.to.map(async (recipient) => {
        const actorObject = await this.getActorObject(recipient)
        return this.trySend(activity, fromName, new URL(recipient).host, actorObject.inbox)
      })
    }
  },

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
