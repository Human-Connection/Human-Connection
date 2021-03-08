export const testNotifications = [
  {
    createdAt: '2020-01-16T10:33:48.651Z',
    updatedAt: '2020-01-16T10:33:48.651Z',
    read: false,
    reason: 'mentioned_in_post',
    from: {
      __typename: 'Post',
      id: 'post-1',
      title: 'some post title',
      slug: 'some-post-title',
      contentExcerpt: 'this is a post content',
      author: {
        id: 'john-1',
        slug: 'john-doe',
        name: 'John Doe',
      },
    },
  },
  {
    createdAt: '2020-01-15T16:33:48.651Z',
    updatedAt: '2020-01-15T16:33:48.651Z',
    read: false,
    reason: 'mentioned_in_comment',
    from: {
      __typename: 'Comment',
      id: 'comment-2',
      contentExcerpt: 'this is yet another post content',
      post: {
        id: 'post-1',
        title: 'some post on a comment',
        slug: 'some-post-on-a-comment',
        contentExcerpt: 'this is a post content',
        author: {
          id: 'john-1',
          slug: 'john-doe',
          name: 'John Doe',
        },
      },
      author: {
        id: 'jane-1',
        slug: 'jane-doe',
        name: 'Jane Doe',
      },
    },
  },
  {
    createdAt: '2020-01-14T12:33:48.651Z',
    updatedAt: '2020-01-14T12:33:48.651Z',
    read: false,
    reason: 'filed_report_on_resource',
    from: {
      __typename: 'FiledReport',
      reportId: 'reportOnUser',
      reasonCategory: 'discrimination_etc',
      reasonDescription: 'This user is harassing me with bigoted remarks!',
      resource: {
        __typename: 'User',
        id: 'badWomen',
        slug: 'mrs.-badwomen',
        name: 'Mrs. Badwomen',
      },
    },
  },
  {
    createdAt: '2019-08-31T17:33:48.651Z',
    updatedAt: '2019-08-31T17:33:48.651Z',
    read: false,
    reason: 'filed_report_on_resource',
    from: {
      __typename: 'FiledReport',
      reportId: 'reportOnUser',
      reasonCategory: 'other',
      reasonDescription: 'Disgusting!',
      resource: {
        __typename: 'Post',
        id: 'badPost',
        createdAt: '2019-10-29T15:38:25.184Z',
        updatedAt: '2019-10-29T15:38:25.184Z',
        disabled: false,
        deleted: false,
        title: 'post title',
        content: 'this is a post content',
        contentExcerpt: 'this is a post content',
        author: {
          id: 'post-author',
          slug: 'post-author',
          name: 'Post Author',
        },
      },
    },
  },
  {
    createdAt: '2019-08-31T17:33:48.651Z',
    updatedAt: '2019-08-31T17:33:48.651Z',
    read: false,
    reason: 'filed_report_on_resource',
    from: {
      __typename: 'FiledReport',
      reportId: 'reportOnUser',
      reasonCategory: 'other',
      reasonDescription: 'Disgusting!',
      resource: {
        __typename: 'Comment',
        id: 'badComment',
        createdAt: '2019-10-29T15:38:25.184Z',
        updatedAt: '2019-10-29T15:38:25.184Z',
        disabled: false,
        deleted: false,
        content: 'this is a comment content',
        contentExcerpt: 'this is a comment content',
        author: {
          id: 'comment-author',
          slug: 'comment-author',
          name: 'Comment Author',
        },
        post: {
          id: 'p4',
          title: 'post title',
          content: 'this is a post content',
          contentExcerpt: 'this is a post content',
          slug: 'some-post',
          author: {
            id: 'post-author',
            slug: 'post-author',
            name: 'Post Author',
          },
        },
      },
    },
  },
]

export const extractNotificationDataOfCurrentUser = (notification, currentUser) => {
  const from = notification.from // for readability
  let user = null
  let post = null
  let comment = null
  let contentExcerpt = null
  let filedReport = null
  let isUser = false
  let isPost = false
  let isComment = false
  let isReport = false
  let reasonTranslationExtention = ''
  let iconName, iconTooltip, triggerer, title, author, linkName, linkParams, linkHashParam

  // extract flattened data out of the deep structure of db response

  // leave undefined data as default, see above. so later by priority user, comment, post we get easely a clou what it is
  switch (from.__typename) {
    case 'Comment':
      comment = from
      post = comment.post
      isComment = true
      iconName = 'comment'
      iconTooltip = 'notifications.comment'
      triggerer = comment.author
      break
    case 'Post':
      post = from
      isPost = true
      iconName = 'bookmark'
      iconTooltip = 'notifications.post'
      triggerer = post.author
      break
    case 'FiledReport':
      filedReport = {
        reasonCategory: from.reasonCategory,
        reasonDescription: from.reasonDescription,
      }
      isReport = true
      iconName = 'balance-scale'
      iconTooltip = 'notifications.filedReport.name'
      triggerer = currentUser
      switch (from.resource.__typename) {
        case 'User':
          user = from.resource
          isUser = true
          reasonTranslationExtention = '.user'
          break
        case 'Comment':
          comment = from.resource
          post = from.resource.post
          isComment = true
          reasonTranslationExtention = '.comment'
          break
        case 'Post':
          post = from.resource
          isPost = true
          reasonTranslationExtention = '.post'
          break
      }
      break
  }

  // extract the content and link data by priority: user, comment, post
  if (user) {
    // it's a user
    title = user.name
    author = user
    linkName = 'profile-id-slug'
    linkParams = { id: user.id, slug: user.slug }
  } else {
    // it's a comment or post
    title = post.title
    linkName = 'post-id-slug'
    linkParams = { id: post.id, slug: post.slug }
    if (comment) {
      // it's a comment
      author = comment.author
      contentExcerpt = comment.contentExcerpt
      linkHashParam = { hash: `#commentId-${comment.id}` }
    } else {
      // it's a post
      author = post.author
      contentExcerpt = post.contentExcerpt
      linkHashParam = {}
    }
  }

  const data = {
    createdAt: notification.createdAt,
    read: notification.read,
    reason: notification.reason,
    notificationSourceId: from.id,
    isUser,
    isPost,
    isComment,
    isReport,
    iconName,
    iconTooltip,
    triggerer,
    user,
    comment,
    post,
    author,
    title,
    contentExcerpt,
    filedReport,
    reasonTranslationExtention,
    linkTo: { name: linkName, params: linkParams, ...linkHashParam },
  }
  return data
}
