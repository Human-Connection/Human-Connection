import gql from 'graphql-tag'

export const state = () => {
  return {
    notifications: null,
    pending: false
  }
}

export const mutations = {
  SET_NOTIFICATIONS(state, notifications) {
    state.notifications = notifications
  },
  SET_PENDING(state, pending) {
    state.pending = pending
  },
  UPDATE_NOTIFICATIONS(state, notification) {
    const notifications = state.notifications
    const toBeUpdated = notifications.find(n => {
      return n.id === notification.id
    })
    toBeUpdated = { ...toBeUpdated, ...notification }
  }
}
export const getters = {
  notifications(state) {
    return !!state.notifications
  }
}

export const actions = {
  async init({ getters, commit }) {
    if (getters.notifications) return
    commit('SET_PENDING', true)
    const client = this.app.apolloProvider.defaultClient
    let notifications
    try {
      const {
        data: { currentUser }
      } = await client.query({
        query: gql(`{
          currentUser {
            id
            notifications(orderBy: createdAt_desc) {
              id
              read
              createdAt
              post {
                author {
                  id
                  slug
                  name
                  disabled
                  deleted
                }
                title
                contentExcerpt
                slug
              }
            }
          }
        }`)
      })
      notifications = currentUser.notifications
      console.log(notifications)
      commit('SET_NOTIFICATIONS', notifications)
    } finally {
      commit('SET_PENDING', false)
    }
    return notifications
  },

  async markAsRead({ commit, rootGetters }, notificationId) {
    const client = this.app.apolloProvider.defaultClient
    const mutation = gql(`
      mutation($id: ID!, $read: Boolean!) {
        UpdateNotification(id: $id, read: $read) {
          id
          read
        }
      }
    `)
    const variables = { id: notificationId, read: true }
    const {
      data: { UpdateNotification }
    } = await client.mutate({ mutation, variables })
    commit('UPDATE_NOTIFICATIONS', UpdateNotification)
  }
}
