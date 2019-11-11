export const notifications = [
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
]
