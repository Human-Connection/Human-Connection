import gql from 'graphql-tag'
export const actions = {
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
  }
}
