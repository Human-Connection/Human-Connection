import { storiesOf } from '@storybook/vue'
import { withA11y } from '@storybook/addon-a11y'
import helpers from '~/storybook/helpers'
import {
  onePostReportedTwoTimes,
  reportedPostDisabledByModerator,
} from './ReportedContent.story/data.js'

import ReportedContent from './ReportedContent.vue'

helpers.init()

const reportedPost = {}
const reportedComment = {}
const reportedUser = {}

storiesOf('ReportedContent', module)
  .addDecorator(withA11y)
  .addDecorator(helpers.layout)
  .add('post', () => ({
    components: { ReportedContent },
    store: helpers.store,
    data: () => ({
      resource: reportedPost,
    }),
    template: '<reported-content :resource="resource" />',
  }))
  .add('comment', () => ({
    components: { ReportedContent },
    store: helpers.store,
    data: () => ({
      resource: reportedComment,
    }),
    template: '<reported-content :resource="resource" />',
  }))
  .add('user', () => ({
    components: { ReportedContent },
    store: helpers.store,
    data: () => ({
      resource: reportedUser,
    }),
    template: '<reported-content :resource="resource" />',
  }))
  .add('same resource reported multiple times', () => ({
    components: { ReportedContent },
    store: helpers.store,
    data: () => ({
      resource: onePostReportedTwoTimes,
    }),
    template: '<reported-content :resource="resource" />',
  }))
  .add('all moderator decision are displayed', () => ({
    components: { ReportedContent },
    store: helpers.store,
    data: () => ({
      resource: reportedPostDisabledByModerator,
    }),
    template: '<reported-content :resource="resource" />',
  }))
