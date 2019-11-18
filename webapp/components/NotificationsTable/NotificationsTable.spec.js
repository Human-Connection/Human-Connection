import { config, mount, createLocalVue, RouterLinkStub } from '@vue/test-utils'
import Styleguide from '@human-connection/styleguide'
import VTooltip from 'v-tooltip'
import Vuex from 'vuex'
import NotificationsTable from './NotificationsTable'
import Filters from '~/plugins/vue-filters'
import { notifications } from '~/components/utils/Notifications'
const localVue = createLocalVue()

localVue.use(Styleguide)
localVue.use(Filters)
localVue.use(VTooltip)
localVue.use(Vuex)
localVue.filter('truncate', string => string)

config.stubs['client-only'] = '<span><slot /></span>'

describe('NotificationsTable.vue', () => {
  let wrapper, mocks, propsData, stubs
  const postNotification = notifications[0]
  const commentNotification = notifications[1]

  beforeEach(() => {
    mocks = {
      $t: jest.fn(string => string),
    }
    stubs = {
      NuxtLink: RouterLinkStub,
    }
    propsData = {}
  })

  describe('mount', () => {
    const Wrapper = () => {
      const store = new Vuex.Store({
        getters: {
          'auth/isModerator': () => false,
          'auth/user': () => {
            return {}
          },
        },
      })
      return mount(NotificationsTable, {
        propsData,
        mocks,
        localVue,
        store,
        stubs,
      })
    }

    beforeEach(() => {
      wrapper = Wrapper()
    })

    describe('no notifications', () => {
      it('renders HcEmpty component', () => {
        expect(wrapper.find('.hc-empty').exists()).toBe(true)
      })
    })

    describe('given notifications', () => {
      beforeEach(() => {
        propsData.notifications = notifications
        wrapper = Wrapper()
      })

      it('renders a table', () => {
        expect(wrapper.find('.ds-table').exists()).toBe(true)
      })

      describe('renders 4 columns', () => {
        it('for icon', () => {
          expect(wrapper.vm.fields.icon).toBeTruthy()
        })

        it('for user', () => {
          expect(wrapper.vm.fields.user).toBeTruthy()
        })

        it('for post', () => {
          expect(wrapper.vm.fields.post).toBeTruthy()
        })

        it('for content', () => {
          expect(wrapper.vm.fields.content).toBeTruthy()
        })
      })

      describe('Post', () => {
        let firstRowNotification
        beforeEach(() => {
          firstRowNotification = wrapper.findAll('tbody tr').at(0)
        })

        it('renders the author', () => {
          const username = firstRowNotification.find('.username')
          expect(username.text()).toEqual(postNotification.from.author.name)
        })

        it('renders the reason for the notification', () => {
          const dsTexts = firstRowNotification.findAll('.ds-text')
          const reason = dsTexts.filter(
            element => element.text() === 'notifications.reason.mentioned_in_post',
          )
          expect(reason.exists()).toBe(true)
        })

        it('renders a link to the Post', () => {
          const postLink = firstRowNotification.find('a.notification-mention-post')
          expect(postLink.text()).toEqual(postNotification.from.title)
        })

        it("renders the Post's content", () => {
          const boldTags = firstRowNotification.findAll('b')
          const content = boldTags.filter(
            element => element.text() === postNotification.from.contentExcerpt,
          )
          expect(content.exists()).toBe(true)
        })
      })

      describe('Comment', () => {
        let secondRowNotification
        beforeEach(() => {
          secondRowNotification = wrapper.findAll('tbody tr').at(1)
        })

        it('renders the author', () => {
          const username = secondRowNotification.find('.username')
          expect(username.text()).toEqual(commentNotification.from.author.name)
        })

        it('renders the reason for the notification', () => {
          const dsTexts = secondRowNotification.findAll('.ds-text')
          const reason = dsTexts.filter(
            element => element.text() === 'notifications.reason.mentioned_in_comment',
          )
          expect(reason.exists()).toBe(true)
        })

        it('renders a link to the Post', () => {
          const postLink = secondRowNotification.find('a.notification-mention-post')
          expect(postLink.text()).toEqual(commentNotification.from.post.title)
        })

        it("renders the Post's content", () => {
          const boldTags = secondRowNotification.findAll('b')
          const content = boldTags.filter(
            element => element.text() === commentNotification.from.contentExcerpt,
          )
          expect(content.exists()).toBe(true)
        })
      })

      describe('unread status', () => {
        it('does not have class `notification-status`', () => {
          expect(wrapper.find('.notification-status').exists()).toBe(false)
        })

        it('clicking on a Post link emits `markNotificationAsRead`', () => {
          wrapper.find('a.notification-mention-post').trigger('click')
          expect(wrapper.emitted().markNotificationAsRead[0][0]).toEqual(postNotification.from.id)
        })

        it('adds class `notification-status` when read is true', () => {
          postNotification.read = true
          wrapper = Wrapper()
          expect(wrapper.find('.notification-status').exists()).toBe(true)
        })
      })
    })
  })
})
