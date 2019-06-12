import gql from 'graphql-tag'

export default {
  postMenuModalsData(truncatedPostName, confirmCallback, cancelCallback = () => {}) {
    return {
      delete: {
        titleIdent: 'delete.contribution.title',
        messageIdent: 'delete.contribution.message',
        messageParams: {
          name: truncatedPostName,
        },
        buttons: {
          confirm: {
            danger: true,
            icon: 'trash',
            textIdent: 'delete.submit',
            callback: confirmCallback,
          },
          cancel: {
            icon: 'close',
            textIdent: 'delete.cancel',
            callback: cancelCallback,
          },
        },
      },
    }
  },
  deletePostMutationData(postId) {
    var gqlMutation = gql`
      mutation($id: ID!) {
        DeletePost(id: $id) {
          id
        }
      }
    `
    return {
      mutation: gqlMutation,
      variables: {
        id: postId,
      },
    }
  },
}
