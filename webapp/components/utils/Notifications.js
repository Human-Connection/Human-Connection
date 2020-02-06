export const testNotifications = [
  {
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
    read: false,
    reason: 'filed_report_on_resource',
    from: {
      __typename: 'Report',
      id: 'reportOnUser',
      filed: [
        {
          reasonCategory: 'discrimination_etc',
          reasonDescription: 'This user is harassing me with bigoted remarks!',
          reportedResource: {
            __typename: 'User',
            id: 'badWomen',
            slug: 'mrs.-badwomen',
            name: 'Mrs. Badwomen',
          },
        },
      ],
    },
  },
]

export const extractNotificationDataOfCurrentUser = (notification, currentUser) => {
  const from = notification.from // for readability
  let user = null
  let post = null
  let comment = null
  let contentExcerpt = null
  let report = null
  let reasonTranslationExtention = ''
  let triggerer
  let title
  let author
  let linkName
  let linkParams
  let linkHashParam

  // extract data out of the deep structure of db response

  // leave undefined data as default, see above, so later by priority user, comment, post we get easely a clou what it is
  switch (from.__typename) {
    case 'Comment':
      comment = from
      post = comment.post
      triggerer = comment.author
      break
    case 'Post':
      post = from
      triggerer = post.author
      break
    case 'Report':
      {
        const filed = from.filed[0] // for readability
        report = {
          reasonCategory: filed.reasonCategory,
          reasonDescription: filed.reasonDescription,
        }
        triggerer = currentUser
        switch (filed.reportedResource.__typename) {
          case 'User':
            user = filed.reportedResource
            reasonTranslationExtention = '.user'
            break
          case 'Comment':
            comment = filed.reportedResource
            post = filed.reportedResource.post
            reasonTranslationExtention = '.comment'
            break
          case 'Post':
            post = filed.reportedResource
            reasonTranslationExtention = '.post'
            break
        }
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
    triggerer,
    user,
    comment,
    post,
    author,
    title,
    contentExcerpt,
    report,
    reasonTranslationExtention,
    linkTo: { name: linkName, params: linkParams, ...linkHashParam },
  }
  return data
}
