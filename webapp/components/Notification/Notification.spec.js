import { config, mount, RouterLinkStub } from '@vue/test-utils'
import Notification from './Notification.vue'

import Vuex from 'vuex'

const localVue = global.localVue

config.stubs['client-only'] = '<span><slot /></span>'

describe('Notification', () => {
  let stubs
  let getters
  let mocks
  let propsData
  let wrapper
  beforeEach(() => {
    propsData = {}
    mocks = {
      $t: (key) => key,
    }
    stubs = {
      NuxtLink: RouterLinkStub,
    }
    getters = {
      'auth/user': () => {
        return {}
      },
      'auth/isModerator': () => false,
    }
  })

  const Wrapper = () => {
    const store = new Vuex.Store({
      getters,
    })
    return mount(Notification, {
      stubs,
      store,
      mocks,
      propsData,
      localVue,
    })
  }

  describe('given a notification about a comment on a post', () => {
    beforeEach(() => {
      propsData.notification = {
        reason: 'commented_on_post',
        from: {
          __typename: 'Comment',
          id: 'comment-1',
          contentExcerpt:
            '<a href="/profile/u123" target="_blank">@dagobert-duck</a> is the best on this comment.',
          post: {
            title: "It's a post title",
            id: 'post-1',
            slug: 'its-a-title',
            contentExcerpt: 'Post content.',
          },
        },
      }
    })

    it('renders reason', () => {
      wrapper = Wrapper()
      expect(wrapper.find('[data-test="reason-text"]').text()).toEqual(
        'notifications.reason.commented_on_post',
      )
    })
    it('renders title', () => {
      wrapper = Wrapper()
      expect(wrapper.text()).toContain("It's a post title")
    })
    it('renders the identifier "notifications.comment"', () => {
      wrapper = Wrapper()
      expect(wrapper.text()).toContain('notifications.comment')
    })
    it('renders the contentExcerpt', () => {
      wrapper = Wrapper()
      expect(wrapper.text()).toContain('@dagobert-duck is the best on this comment.')
    })
    it('has no class "--read"', () => {
      wrapper = Wrapper()
      expect(wrapper.classes()).not.toContain('--read')
    })

    describe('that is read', () => {
      beforeEach(() => {
        propsData.notification.read = true
        wrapper = Wrapper()
      })

      it('has class "--read"', () => {
        expect(wrapper.classes()).toContain('--read')
      })
    })
  })

  describe('given a notification about a mention in a post', () => {
    beforeEach(() => {
      propsData.notification = {
        reason: 'mentioned_in_post',
        from: {
          __typename: 'Post',
          title: "It's a post title",
          id: 'post-1',
          slug: 'its-a-title',
          contentExcerpt:
            '<a href="/profile/u3" target="_blank">@jenny-rostock</a> is the best on this post.',
        },
      }
    })

    it('renders reason', () => {
      wrapper = Wrapper()
      expect(wrapper.find('[data-test="reason-text"]').text()).toEqual(
        'notifications.reason.mentioned_in_post',
      )
    })
    it('renders title', () => {
      wrapper = Wrapper()
      expect(wrapper.text()).toContain("It's a post title")
    })
    it('renders the contentExcerpt', () => {
      wrapper = Wrapper()
      expect(wrapper.text()).toContain('@jenny-rostock is the best on this post.')
    })
    it('has no class "--read"', () => {
      wrapper = Wrapper()
      expect(wrapper.classes()).not.toContain('--read')
    })

    describe('that is read', () => {
      beforeEach(() => {
        propsData.notification.read = true
        wrapper = Wrapper()
      })

      it('has class "--read"', () => {
        expect(wrapper.classes()).toContain('--read')
      })
    })
  })

  describe('given a notification about a mention in a comment', () => {
    beforeEach(() => {
      propsData.notification = {
        reason: 'mentioned_in_comment',
        from: {
          __typename: 'Comment',
          id: 'comment-1',
          contentExcerpt:
            '<a href="/profile/u123" target="_blank">@dagobert-duck</a> is the best on this comment.',
          post: {
            title: "It's a post title",
            id: 'post-1',
            slug: 'its-a-title',
            contentExcerpt: 'Post content.',
          },
        },
      }
    })

    it('renders reason', () => {
      wrapper = Wrapper()
      expect(wrapper.find('[data-test="reason-text"]').text()).toEqual(
        'notifications.reason.mentioned_in_comment',
      )
    })

    it('renders title', () => {
      wrapper = Wrapper()
      expect(wrapper.text()).toContain("It's a post title")
    })

    it('renders the identifier "notifications.comment"', () => {
      wrapper = Wrapper()
      expect(wrapper.text()).toContain('notifications.comment')
    })

    it('renders the contentExcerpt', () => {
      wrapper = Wrapper()
      expect(wrapper.text()).toContain('@dagobert-duck is the best on this comment.')
    })

    it('has no class "--read"', () => {
      wrapper = Wrapper()
      expect(wrapper.classes()).not.toContain('--read')
    })

    describe('that is read', () => {
      beforeEach(() => {
        propsData.notification.read = true
        wrapper = Wrapper()
      })

      it('has class "--read"', () => {
        expect(wrapper.classes()).toContain('--read')
      })
    })
  })

  describe('given a notification about the user has filed a report', () => {
    beforeEach(() => {
      propsData.notification = {
        reason: 'filed_report_on_resource',
        from: {
          __typename: 'FiledReport',
          reportId: 'reportOnUser',
          reasonCategory: 'discrimination_etc',
          reasonDescription: 'This user is harassing me with bigoted remarks!',
          resource: {
            __typename: 'User',
            id: 'badWomen',
            slug: 'mrs.-badwomen',
            name: 'Mrs. Badwomen',
          },
        },
      }
    })

    it('renders reason', () => {
      wrapper = Wrapper()
      expect(wrapper.find('[data-test="reason-text"]').text()).toEqual(
        'notifications.reason.filed_report_on_resource.user',
      )
    })

    it('renders title', () => {
      wrapper = Wrapper()
      expect(wrapper.text()).toContain('Mrs. Badwomen')
    })

    it('renders the reported users slug', () => {
      wrapper = Wrapper()
      expect(wrapper.text()).toContain('@mrs.-badwomen')
    })

    it('renders the identifier "notifications.filedReport.category"', () => {
      wrapper = Wrapper()
      expect(wrapper.text()).toContain('notifications.filedReport.category')
    })

    it('renders the identifier "notifications.filedReport.description"', () => {
      wrapper = Wrapper()
      expect(wrapper.text()).toContain('notifications.filedReport.description')
    })

    it('has no class "read"', () => {
      wrapper = Wrapper()
      expect(wrapper.classes()).not.toContain('--read')
    })

    describe('that is read', () => {
      beforeEach(() => {
        propsData.notification.read = true
        wrapper = Wrapper()
      })

      it('has class "--read"', () => {
        expect(wrapper.classes()).toContain('--read')
      })
    })
  })
})
