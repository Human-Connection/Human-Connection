import PostMutations from '~/graphql/PostMutations.js'

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
  return {
    mutation: PostMutations().DeletePost,
    variables: {
      id: postId,
    },
  }
}
