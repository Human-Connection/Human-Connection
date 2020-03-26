import { config, mount, RouterLinkStub } from '@vue/test-utils'
import Vuex from 'vuex'
import ReportRow from './ReportRow.vue'
import BaseIcon from '~/components/_new/generic/BaseIcon/BaseIcon'
import { reports } from '~/components/features/ReportList/ReportList.story.js'

const localVue = global.localVue

config.stubs['client-only'] = '<span><slot /></span>'

describe('ReportRow', () => {
  let propsData, mocks, stubs, getters, wrapper

  beforeEach(() => {
    propsData = {}
    mocks = {
      $t: jest.fn((string) => string),
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

  describe('given a report ', () => {
    const Wrapper = () => {
      const store = new Vuex.Store({
        getters,
      })
      return mount(ReportRow, { propsData, mocks, stubs, localVue, store })
    }

    describe('has not been closed', () => {
      let confirmButton
      beforeEach(() => {
        propsData = { ...propsData, report: reports[1] }
        wrapper = Wrapper()
        confirmButton = wrapper.find('.base-button.--danger')
      })

      it('renders a confirm button', () => {
        expect(confirmButton.exists()).toBe(true)
      })

      it('emits confirm event', () => {
        confirmButton.trigger('click')
        expect(wrapper.emitted('confirm-report')).toHaveLength(1)
      })
    })

    describe('has been closed', () => {
      beforeEach(() => {
        propsData = { ...propsData, report: reports[2] }
        wrapper = Wrapper()
      })

      it('renders a decided text', () => {
        const decidedTitle = wrapper
          .findAll('.title')
          .filter((title) => title.text() === 'moderation.reports.decided')
        expect(decidedTitle.exists()).toBe(true)
      })
    })

    describe('has not been reviewed', () => {
      beforeEach(() => {
        propsData = { ...propsData, report: reports[1] }
        wrapper = Wrapper()
      })

      it('renders its current status', () => {
        expect(wrapper.find('.status-line').text()).toEqual('moderation.reports.enabled')
      })
    })

    describe('has been reviewed', () => {
      describe('and disabled', () => {
        beforeEach(() => {
          propsData = { ...propsData, report: reports[2] }
          wrapper = Wrapper()
        })
        it('renders the disabled icon', () => {
          expect(wrapper.find('.status-line').find(BaseIcon).props().name).toEqual('eye-slash')
        })

        it('renders its current status', () => {
          expect(wrapper.find('.status-line').text()).toEqual('moderation.reports.disabledBy')
        })
      })

      describe('and enabled', () => {
        beforeEach(() => {
          propsData = { ...propsData, report: reports[0] }
          wrapper = Wrapper()
        })
        it('renders the enabled icon', () => {
          expect(wrapper.find('.status-line').find(BaseIcon).props().name).toEqual('eye')
        })

        it('renders its current status', () => {
          expect(wrapper.find('.status-line').text()).toEqual('moderation.reports.enabledBy')
        })

        it('renders the moderator who reviewed the resource', () => {
          const username = wrapper.find('[data-test="report-reviewer"]')
          expect(username.text()).toContain('@moderator')
        })
      })
    })

    describe('concerns a Comment', () => {
      beforeEach(() => {
        propsData = { ...propsData, report: reports[0] }
        wrapper = Wrapper()
      })

      it('renders a comments icon', () => {
        const commentsIcon = wrapper.find(BaseIcon).props().name
        expect(commentsIcon).toEqual('comments')
      })

      it('renders a link to the post, with the comment contentExcerpt', () => {
        const postLink = wrapper.find('.title')
        expect(postLink.text()).toEqual('@peter-lustig Lorem ipsum dolor sit amet, …')
      })

      it('renders the author', () => {
        const userSlug = wrapper.find('[data-test="report-author"]')
        expect(userSlug.text()).toContain('@louie')
      })
    })

    describe('concerns a Post', () => {
      beforeEach(() => {
        propsData = { ...propsData, report: reports[1] }
        wrapper = Wrapper()
      })

      it('renders a bookmark icon', () => {
        const postIcon = wrapper.find(BaseIcon).props().name
        expect(postIcon).toEqual('bookmark')
      })

      it('renders a link to the post', () => {
        const postLink = wrapper.find('.title')
        expect(postLink.text()).toEqual("I'm a bigoted post!")
      })

      it('renders the author', () => {
        const username = wrapper.find('[data-test="report-author"]')
        expect(username.text()).toContain('@dagobert')
      })
    })

    describe('concerns a User', () => {
      beforeEach(() => {
        propsData = { ...propsData, report: reports[2] }
        wrapper = Wrapper()
      })

      it('renders a user icon', () => {
        const userIcon = wrapper.find(BaseIcon).props().name
        expect(userIcon).toEqual('user')
      })

      it('renders a link to the user profile', () => {
        const userLink = wrapper.find('[data-test="report-content"]')
        expect(userLink.text()).toContain('@abusive-user')
      })
    })
  })
})
