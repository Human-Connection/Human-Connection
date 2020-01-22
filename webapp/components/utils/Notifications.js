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
  const from = notification.from
  let triggerer
  const id = from.id
  const createdAt = notification.createdAt
  const read = notification.read
  const reason = notification.reason
  let title
  let author
  let user = null
  let post = null
  let comment = null
  let contentExcerpt = null
  let report = null
  let reasonExtention = ''

  if (from.__typename === 'Post') {
    post = from
    triggerer = post.author
  } else if (from.__typename === 'Comment') {
    comment = from
    triggerer = comment.author
    post = comment.post
  } else if (from.__typename === 'Report') {
    report = {
      reasonCategory: from.filed[0].reasonCategory,
      reasonDescription: from.filed[0].reasonDescription,
    }
    triggerer = currentUser
    if (from.filed[0].reportedResource.__typename === 'User') {
      user = from.filed[0].reportedResource
      reasonExtention = '.user'
    } else if (from.filed[0].reportedResource.__typename === 'Post') {
      post = from.filed[0].reportedResource
      reasonExtention = '.post'
    } else if (from.filed[0].reportedResource.__typename === 'Comment') {
      comment = from.filed[0].reportedResource
      post = from.filed[0].reportedResource.post
      reasonExtention = '.comment'
    }
  }

  if (user) {
    title = user.name
    author = user
  } else {
    title = post.title
    if (comment) {
      author = comment.author
      contentExcerpt = comment.contentExcerpt
    } else {
      author = post.author
      contentExcerpt = post.contentExcerpt
    }
  }

  const params = user
    ? {
        id: user.id,
        slug: user.slug,
      }
    : post
    ? {
        id: post.id,
        slug: post.slug,
      }
    : {}
  const hashParam = comment ? { hash: `#commentId-${comment.id}` } : {}
  const linkTo = {
    name: user ? 'profile-id-slug' : 'post-id-slug',
    params,
    ...hashParam,
  }

  const data = {
    triggerer,
    id,
    createdAt,
    read,
    reason,
    title,
    user,
    post,
    comment,
    contentExcerpt,
    author,
    report,
    reasonExtention,
    linkTo,
  }
  return data
}
