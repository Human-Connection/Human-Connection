import { config, mount, createLocalVue, RouterLinkStub } from '@vue/test-utils'
import Notification from './Notification.vue'
import Styleguide from '@human-connection/styleguide'
import Filters from '~/plugins/vue-filters'
import Vuex from 'vuex'

const localVue = createLocalVue()

localVue.use(Vuex)
localVue.use(Styleguide)
localVue.use(Filters)

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
      $t: key => key,
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
      expect(wrapper.find('.reason-text-for-test').text()).toEqual(
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
    it('has no class "read"', () => {
      wrapper = Wrapper()
      expect(wrapper.classes()).not.toContain('read')
    })

    describe('that is read', () => {
      beforeEach(() => {
        propsData.notification.read = true
        wrapper = Wrapper()
      })

      it('has class "read"', () => {
        expect(wrapper.classes()).toContain('read')
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
      expect(wrapper.find('.reason-text-for-test').text()).toEqual(
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
    it('has no class "read"', () => {
      wrapper = Wrapper()
      expect(wrapper.classes()).not.toContain('read')
    })

    describe('that is read', () => {
      beforeEach(() => {
        propsData.notification.read = true
        wrapper = Wrapper()
      })

      it('has class "read"', () => {
        expect(wrapper.classes()).toContain('read')
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
      expect(wrapper.find('.reason-text-for-test').text()).toEqual(
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

    it('has no class "read"', () => {
      wrapper = Wrapper()
      expect(wrapper.classes()).not.toContain('read')
    })

    describe('that is read', () => {
      beforeEach(() => {
        propsData.notification.read = true
        wrapper = Wrapper()
      })

      it('has class "read"', () => {
        expect(wrapper.classes()).toContain('read')
      })
    })
  })
})
