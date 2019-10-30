import { storiesOf } from '@storybook/vue'
import { withA11y } from '@storybook/addon-a11y'
import HcCommentList from './CommentList.vue'
import helpers from '~/storybook/helpers'
import faker from 'faker'

helpers.init()

const commentMock = fields => {
  return {
    id: faker.random.uuid(),
    title: faker.lorem.sentence(),
    content: faker.lorem.paragraph(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    deleted: false,
    disabled: false,
    ...fields,
  }
}

const comments = [
  commentMock(),
  commentMock(),
  commentMock(),
  commentMock(),
  commentMock(),
  commentMock(),
  commentMock(),
  commentMock(),
  commentMock(),
  commentMock(),
]

storiesOf('CommentList', module)
  .addDecorator(withA11y)
  .addDecorator(helpers.layout)
  .add('given 10 comments', () => ({
    components: { HcCommentList },
    store: helpers.store,
    data: () => ({
      post: { comments },
    }),
    template: `<hc-comment-list :post="post" />`,
  }))
