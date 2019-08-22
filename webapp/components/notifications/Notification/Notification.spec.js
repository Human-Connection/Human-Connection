import { config, mount, createLocalVue, RouterLinkStub } from '@vue/test-utils'
import Notification from './Notification'
import Styleguide from '@human-connection/styleguide'
import Filters from '~/plugins/vue-filters'

const localVue = createLocalVue()

localVue.use(Styleguide)
localVue.use(Filters)

config.stubs['no-ssr'] = '<span><slot /></span>'

describe('Notification', () => {
  let stubs
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
  })

  const Wrapper = () => {
    return mount(Notification, {
      stubs,
      mocks,
      propsData,
      localVue,
    })
  }

  describe('given a notification about a comment on a post', () => {
    beforeEach(() => {
      propsData.notification = {
        reason: 'comment_on_post',
        post: null,
        comment: {
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
        'notifications.menu.comment_on_post',
      )
    })
    it('renders title', () => {
      wrapper = Wrapper()
      expect(wrapper.text()).toContain("It's a post title")
    })
    it('renders the "Comment:"', () => {
      wrapper = Wrapper()
      expect(wrapper.text()).toContain('Comment:')
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
        post: {
          title: "It's a post title",
          id: 'post-1',
          slug: 'its-a-title',
          contentExcerpt:
            '<a href="/profile/u3" target="_blank">@jenny-rostock</a> is the best on this post.',
        },
        comment: null,
      }
    })

    it('renders reason', () => {
      wrapper = Wrapper()
      expect(wrapper.find('.reason-text-for-test').text()).toEqual(
        'notifications.menu.mentioned_in_post',
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
        post: null,
        comment: {
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
        'notifications.menu.mentioned_in_comment',
      )
    })
    it('renders title', () => {
      wrapper = Wrapper()
      expect(wrapper.text()).toContain("It's a post title")
    })

    it('renders the "Comment:"', () => {
      wrapper = Wrapper()
      expect(wrapper.text()).toContain('Comment:')
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
