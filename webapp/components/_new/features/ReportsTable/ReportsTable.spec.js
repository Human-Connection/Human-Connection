import { config, mount, RouterLinkStub } from '@vue/test-utils'
import Vuex from 'vuex'
import ReportsTable from './ReportsTable.vue'
import { reports } from './ReportsTable.story.js'
import BaseIcon from '~/components/_new/generic/BaseIcon/BaseIcon'

const localVue = global.localVue

config.stubs['client-only'] = '<span><slot /></span>'

describe('ReportsTable', () => {
  let propsData, mocks, stubs, getters, wrapper, reportsTable

  beforeEach(() => {
    propsData = {}
    mocks = {
      $t: jest.fn(string => string),
    }
    stubs = {
      NuxtLink: RouterLinkStub,
    }
    getters = {
      'auth/user': () => {
        return { slug: 'awesome-user' }
      },
      'auth/isModerator': () => true,
    }
  })

  describe('mount', () => {
    const Wrapper = () => {
      const store = new Vuex.Store({
        getters,
      })
      return mount(ReportsTable, { propsData, mocks, stubs, localVue, store })
    }

    describe('given no reports', () => {
      beforeEach(() => {
        propsData = { ...propsData, reports: [] }
        wrapper = Wrapper()
      })

      it('shows a placeholder', () => {
        expect(wrapper.text()).toContain('moderation.reports.empty')
      })
    })

    describe('given reports', () => {
      beforeEach(() => {
        propsData = { ...propsData, reports }
        wrapper = Wrapper()
        reportsTable = wrapper.find('.ds-table')
      })

      it('renders a table', () => {
        expect(reportsTable.exists()).toBe(true)
      })

      describe('Comment', () => {
        let commentRow
        beforeEach(() => {
          commentRow = wrapper.find('[data-test="Comment"]')
        })

        it('renders a comments icon', () => {
          const commentsIcon = commentRow.find(BaseIcon).props().name
          expect(commentsIcon).toEqual('comments')
        })

        it('renders a link to the post, with the comment contentExcerpt', () => {
          const postLink = commentRow.find('[data-test="post-link"]')
          expect(postLink.text()).toEqual('@peter-lustig Lorem ipsum dolor sit amet, …')
        })

        it('renders the author', () => {
          const username = commentRow.find('[data-test="louie"] b')
          expect(username.text()).toEqual('Louie')
        })

        describe('given it has been reviewed', () => {
          it('renders the enabled icon', () => {
            const enabledIcon = commentRow
              .findAll(BaseIcon)
              .filter(icon => icon.props().name === 'eye')
            expect(enabledIcon.exists()).toBe(true)
          })

          it('renders its current status', () => {
            expect(commentRow.find('[data-test="enabled"]').text()).toEqual(
              'moderation.reports.enabledBy',
            )
          })

          it('renders the moderator who reviewed the resource', () => {
            const username = commentRow.find('[data-test="moderator"] b')
            expect(username.text()).toEqual('Moderator')
          })
        })

        describe('give report has not been closed', () => {
          let confirmButton
          beforeEach(() => {
            confirmButton = commentRow.find('button.confirm')
          })
          it('renders a confirm button', () => {
            expect(confirmButton.exists()).toBe(true)
          })

          it('emits confirm event', () => {
            confirmButton.trigger('click')
            expect(wrapper.emitted().confirm[0][0]).toEqual(reports[0])
          })
        })
      })

      describe('Post', () => {
        let postRow
        beforeEach(() => {
          postRow = wrapper.find('[data-test="Post"]')
        })

        it('renders a bookmark icon', () => {
          const postIcon = postRow.find(BaseIcon).props().name
          expect(postIcon).toEqual('bookmark')
        })

        it('renders a link to the post', () => {
          const postLink = postRow.find('[data-test="post-link"]')
          expect(postLink.text()).toEqual("I'm a bigoted post!")
        })

        it('renders the author', () => {
          const username = postRow.find('[data-test="dagobert"] b')
          expect(username.text()).toEqual('Dagobert')
        })

        describe('given it has not been reviewed', () => {
          it('renders the enabled icon', () => {
            const enabledIcon = postRow
              .findAll(BaseIcon)
              .filter(icon => icon.props().name === 'eye')
            expect(enabledIcon.exists()).toBe(true)
          })

          it('renders its current status', () => {
            expect(postRow.find('[data-test="unreviewed"]').text()).toEqual(
              'moderation.reports.enabled',
            )
          })
        })

        describe('give report has not been closed', () => {
          let confirmButton
          beforeEach(() => {
            confirmButton = postRow.find('button.confirm')
          })

          it('renders a confirm button', () => {
            expect(confirmButton.exists()).toBe(true)
          })

          it('emits confirm event', () => {
            confirmButton.trigger('click')
            expect(wrapper.emitted().confirm[0][0]).toEqual(reports[1])
          })
        })
      })

      describe('User', () => {
        let userRow
        beforeEach(() => {
          userRow = wrapper.find('[data-test="User"]')
        })

        it('renders a bookmark icon', () => {
          const userIcon = userRow.find(BaseIcon).props().name
          expect(userIcon).toEqual('user')
        })

        it('renders a link to the user profile', () => {
          const userLink = userRow.find('[data-test="abusive-user"] b')
          expect(userLink.text()).toEqual('Abusive user')
        })

        describe('given it has been reviewed', () => {
          it('renders the disabled icon', () => {
            const disabledIcon = userRow
              .findAll(BaseIcon)
              .filter(icon => icon.props().name === 'eye-slash')
            expect(disabledIcon.exists()).toBe(true)
          })

          it('renders its current status', () => {
            expect(userRow.find('[data-test="disabled"]').text()).toEqual(
              'moderation.reports.disabledBy',
            )
          })

          it('renders the moderator who reviewed the resource', () => {
            const username = userRow.find('[data-test="peter-lustig"] b')
            expect(username.text()).toEqual('Peter Lustig')
          })
        })

        describe('give report has been closed', () => {
          it('renders Decided text', () => {
            expect(userRow.find('[data-test="closed"]').text()).toEqual(
              'moderation.reports.decided',
            )
          })
        })
      })
    })
  })
})
