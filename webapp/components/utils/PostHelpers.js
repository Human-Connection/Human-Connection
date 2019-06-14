import gql from 'graphql-tag'

export function postMenuModalsData(truncatedPostName, confirmCallback, cancelCallback = () => {}) {
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
}

export function deletePostMutation(postId) {
  // TODO: Replace "gqlMutation" with "DeletePost" from '~/graphql/PostMutations.js', has not worked for me.
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
}
