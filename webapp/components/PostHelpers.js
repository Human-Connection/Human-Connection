import gql from 'graphql-tag'

export default {
  postMenuModalsData: (postNameShort, confirmCallback) => {
    return {
      delete: {
        titleIdent: 'delete.contribution.title',
        messageIdent: 'delete.contribution.message',
        messageParams: {
          name: postNameShort,
        },
        buttons: {
          confirm: {
            icon: 'trash',
            textIdent: 'delete.submit',
            callback: confirmCallback,
          },
          cancel: {
            icon: 'close',
            textIdent: 'delete.cancel',
            callback: () => {},
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
