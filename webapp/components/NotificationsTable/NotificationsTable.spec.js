import { config, mount, RouterLinkStub } from '@vue/test-utils'

import Vuex from 'vuex'
import NotificationsTable from './NotificationsTable'

import { testNotifications } from '~/components/utils/Notifications'
const localVue = global.localVue

localVue.filter('truncate', (string) => string)

config.stubs['client-only'] = '<span><slot /></span>'

describe('NotificationsTable.vue', () => {
  let wrapper, mocks, propsData, stubs
  const notifications = testNotifications
  const postNotification = notifications[0]
  const commentNotification = notifications[1]
  const reportNotification = notifications[2]

  beforeEach(() => {
    mocks = {
      $t: jest.fn((string) => string),
      $i18n: {
        locale: () => 'en',
      },
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
            return {
              name: 'myName',
            }
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
          expect(wrapper.vm.fields.triggerer).toBeTruthy()
        })

        it('for post', () => {
          expect(wrapper.vm.fields.title).toBeTruthy()
        })

        it('for content', () => {
          expect(wrapper.vm.fields.metadata).toBeTruthy()
        })
      })

      describe('Post', () => {
        let firstRowNotification
        beforeEach(() => {
          firstRowNotification = wrapper.findAll('tbody tr').at(0)
        })

        it('renders the author', () => {
          const userinfo = firstRowNotification.find('.user-teaser > .info')
          expect(userinfo.text()).toContain(postNotification.from.author.name)
        })

        it('renders the reason for the notification', () => {
          const dsTexts = firstRowNotification.findAll('.ds-text')
          const reason = dsTexts.filter(
            (element) => element.text() === 'notifications.reason.mentioned_in_post',
          )
          expect(reason.exists()).toBe(true)
        })

        it('renders a link to the post', () => {
          const postLink = firstRowNotification.find('[data-test="notification-title-link"]')
          expect(postLink.text()).toEqual(postNotification.from.title)
        })

        it("renders the post's content", () => {
          wrapper = Wrapper()
          expect(wrapper.text()).toContain(postNotification.from.contentExcerpt)
        })
      })

      describe('Comment', () => {
        let secondRowNotification
        beforeEach(() => {
          secondRowNotification = wrapper.findAll('tbody tr').at(1)
        })

        it('renders the author', () => {
          const userinfo = secondRowNotification.find('.user-teaser > .info')
          expect(userinfo.text()).toContain(commentNotification.from.author.name)
        })

        it('renders the reason for the notification', () => {
          const dsTexts = secondRowNotification.findAll('.ds-text')
          const reason = dsTexts.filter(
            (element) => element.text() === 'notifications.reason.mentioned_in_comment',
          )
          expect(reason.exists()).toBe(true)
        })

        it('renders a link to the post', () => {
          const postLink = secondRowNotification.find('[data-test="notification-title-link"]')
          expect(postLink.text()).toEqual(commentNotification.from.post.title)
        })

        it("renders the comment's content", () => {
          wrapper = Wrapper()
          expect(wrapper.text()).toContain(commentNotification.from.contentExcerpt)
        })
      })

      describe('Report', () => {
        let thirdRowNotification
        beforeEach(() => {
          thirdRowNotification = wrapper.findAll('tbody tr').at(2)
        })

        it('renders me as the triggerer', () => {
          const triggererName = thirdRowNotification.find('[data-test="userName"]')
          expect(triggererName.text()).toEqual('myName')
        })

        it('renders the reason for the notification', () => {
          const dsTexts = thirdRowNotification.findAll('.ds-text')
          const reason = dsTexts.filter(
            (element) => element.text() === 'notifications.reason.filed_report_on_resource.user',
          )
          expect(reason.exists()).toBe(true)
        })

        it('renders a link to the user', () => {
          const userLink = thirdRowNotification.find('[data-test="notification-title-link"]')
          expect(userLink.text()).toEqual(reportNotification.from.resource.name)
        })

        it('renders the reported users slug', () => {
          wrapper = Wrapper()
          expect(wrapper.text()).toContain('@mrs.-badwomen')
        })

        it('renders the identifier "notifications.filedReport.category"', () => {
          wrapper = Wrapper()
          expect(wrapper.text()).toContain('notifications.filedReport.category')
        })

        it('renders the reported category', () => {
          wrapper = Wrapper()
          expect(wrapper.text()).toContain(
            'report.reason.category.options.' + reportNotification.from.reasonCategory,
          )
        })

        it('renders the identifier "notifications.filedReport.description"', () => {
          wrapper = Wrapper()
          expect(wrapper.text()).toContain('notifications.filedReport.description')
        })

        it('renders the reported description', () => {
          wrapper = Wrapper()
          expect(wrapper.text()).toContain(reportNotification.from.reasonDescription)
        })
      })

      describe('unread status', () => {
        it('does not have class `notification-status`', () => {
          expect(wrapper.find('.notification-status').exists()).toBe(false)
        })

        it('clicking on a Post link emits `markNotificationAsRead`', () => {
          wrapper.find('[data-test="notification-title-link"]').trigger('click')
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
