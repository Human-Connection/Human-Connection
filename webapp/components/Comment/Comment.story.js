import { storiesOf } from '@storybook/vue'
import { withA11y } from '@storybook/addon-a11y'
import Comment from './Comment'
import helpers from '~/storybook/helpers'

helpers.init()

const comment = {
  id: '5d42a2277f2725002a449cb3',
  content:
    '<p></p><p>Thank you all!</p><p><a href="/profile/5ab6a050896325000a59e514" target="_blank">@wolfgang-huss</a> <a href="/profile/5b1693daf850c11207fa6109" target="_blank">@robert-schafer</a> <a href="/profile/5a663b1ac64291000bf302a1" target="_blank">@greg</a> <a href="/profile/5acc8a337c6b11000b3c7612" target="_blank">@human-connection</a></p><p>watch my video</p><p><a href="https://www.youtube.com/watch?v=EeVspZ8jC6I" class="embed" target="_blank"></a></p><p></p><p>I think we can all learn a lot from Alex\'s video :) </p><p>It\'s really great stuff!!</p><p>Please give him a big smiley face emoticon :D</p>',
  contentExcerpt:
    '<p></p><p>Thank you all!</p><p><a href="/profile/5ab6a050896325000a59e514" target="_blank">@wolfgang-huss</a> <a href="/profile/5b1693daf850c11207fa6109" target="_blank">@robert-schafer</a> <a href="/profile/5a663b1ac64291000bf302a1" target="_blank">@greg</a> <a href="/profile/5acc8a337c6b11000b3c7612" target="_blank">@human-connection</a></p><p>watch my video</p><p><a href="https://www.youtube.com/watch?v=EeVspZ8jC6I" target="_blank"></a></p><p></p><p>I think we can all learn a lot from Alex\'s video :) </p><p>It\'s really great stuff!!</p><p>Please give him a …</p>',
  createdAt: '2019-08-01T08:26:15.839Z',
  updatedAt: '2019-08-01T08:26:15.839Z',
  deleted: false,
  disabled: false,
  author: {
    id: '1',
    avatar:
      'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/db/dbc9e03ebcc384b920c31542af2d27dd8eea9dc2_full.jpg',
    slug: 'jenny-rostock',
    name: 'Rainer Unsinn',
    disabled: false,
    deleted: false,
    contributionsCount: 25,
    shoutedCount: 5,
    commentedCount: 39,
    followedByCount: 2,
    followedByCurrentUser: true,
    location: null,
    badges: [
      {
        id: 'indiegogo_en_bear',
        icon: '/img/badges/indiegogo_en_bear.svg',
        __typename: 'Badge',
      },
    ],
    __typename: 'User',
  },
  __typename: 'Comment',
}

storiesOf('Comment', module)
  .addDecorator(withA11y)
  .addDecorator(helpers.layout)
  .add('Basic comment', () => ({
    components: { Comment },
    store: helpers.store,
    data: () => ({
      comment,
    }),
    template: `<comment :key="comment.id" :comment="comment" />`,
  }))
