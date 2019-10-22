export const onePostReportedTwoTimes = {
  type: 'Post',
  user: null,
  comment: null,
  post: {
    id: '291fef1b-c7ff-402f-a6eb-e4af182e0917',
    slug: 'vento',
    title: 'Vento',
    disabled: false,
    deleted: false,
    author: {
      id: 'u3',
      slug: 'jenny-rostock',
      name: 'Jenny Rostock',
      disabled: false,
      deleted: false,
    },
    disabledBy: null,
  },
  log: [
    {
      type: 'REPORTED',
      createdAt: '2019-10-22T10:23:39.952Z',
      reasonCategory: 'intentional_intimidation_stalking_persecution',
      reasonDescription: '',
      submitter: {
        id: 'u5',
        slug: 'dewey',
        name: 'Dewey',
        disabled: false,
        deleted: false,
      },
    },
    {
      type: 'REPORTED',
      createdAt: '2019-10-22T10:23:15.373Z',
      reasonCategory: 'intentional_intimidation_stalking_persecution',
      reasonDescription: '',
      submitter: {
        id: 'u4',
        slug: 'huey',
        name: 'Huey',
        disabled: false,
        deleted: false,
      },
    },
  ],
}

export const reportedPostDisabledByModerator = {
  createdAt: '2019-10-22T19:13:49.281Z',
  type: 'Post',
  user: null,
  comment: null,
  post: {
    id: 'p1',
    slug: 'quam-est-expedita-sunt-corporis-dolorem-minus',
    title: 'Quam est expedita sunt corporis dolorem minus.',
    disabled: true,
    deleted: false,
    author: {
      id: 'u2',
      slug: 'bob-der-baumeister',
      name: 'Bob der Baumeister',
      disabled: false,
      deleted: false,
    },
    disabledBy: {
      id: 'u1',
      slug: 'peter-lustig',
      name: 'Peter Lustig',
      disabled: false,
      deleted: false,
    },
  },
  log: [
    {
      type: 'REPORTED',
      reasonCategory: 'discrimination_etc',
      reasonDescription: 'This post is bigoted',
      submitter: {
        id: 'u4',
        slug: 'huey',
        name: 'Huey',
        disabled: false,
        deleted: false,
      },
    },
    {
      type: 'DISABLED',
      moderator: {
        id: 'u1',
        slug: 'peter-lustig',
        name: 'Peter Lustig',
      },
    },
  ],
}
