import { config, mount, RouterLinkStub } from '@vue/test-utils'
import NotificationMenu from './NotificationMenu'

const localVue = global.localVue

localVue.filter('truncate', (string) => string)

config.stubs.dropdown = '<span class="dropdown"><slot :toggleMenu="() => null" /></span>'

describe('NotificationMenu.vue', () => {
  let wrapper
  let mocks
  let data
  let stubs
  beforeEach(() => {
    mocks = {
      $t: jest.fn(),
    }
    data = () => {
      return {
        notifications: [],
      }
    }
    stubs = {
      NuxtLink: RouterLinkStub,
    }
  })

  describe('mount', () => {
    const Wrapper = () => {
      return mount(NotificationMenu, {
        data,
        mocks,
        localVue,
        stubs,
      })
    }

    it('renders as link without counter', () => {
      wrapper = Wrapper()
      expect(wrapper.is('a.notifications-menu')).toBe(true)
      expect(() => wrapper.get('.count')).toThrow()
    })

    it('no dropdown is rendered', () => {
      wrapper = Wrapper()
      expect(wrapper.contains('.dropdown')).toBe(false)
    })

    describe('given only read notifications', () => {
      beforeEach(() => {
        data = () => {
          return {
            notifications: [
              {
                id: 'notification-41',
                read: true,
                post: {
                  id: 'post-1',
                  title: 'some post title',
                  contentExcerpt: 'this is a post content',
                  author: {
                    id: 'john-1',
                    slug: 'john-doe',
                    name: 'John Doe',
                  },
                },
              },
            ],
          }
        }
      })

      it('renders as link without counter', () => {
        wrapper = Wrapper()
        expect(wrapper.is('a.notifications-menu')).toBe(true)
        expect(() => wrapper.get('.count')).toThrow()
      })

      it('no dropdown is rendered', () => {
        wrapper = Wrapper()
        expect(wrapper.contains('.dropdown')).toBe(false)
      })
    })

    describe('given some notifications', () => {
      beforeEach(() => {
        data = () => {
          return {
            notifications: [
              {
                id: 'notification-41',
                read: false,
                post: {
                  id: 'post-1',
                  title: 'some post title',
                  contentExcerpt: 'this is a post content',
                  author: {
                    id: 'john-1',
                    slug: 'john-doe',
                    name: 'John Doe',
                  },
                },
              },
              {
                id: 'notification-42',
                read: false,
                post: {
                  id: 'post-2',
                  title: 'another post title',
                  contentExcerpt: 'this is yet another post content',
                  author: {
                    id: 'john-1',
                    slug: 'john-doe',
                    name: 'John Doe',
                  },
                },
              },
              {
                id: 'notification-43',
                read: true,
                post: {
                  id: 'post-3',
                  title: 'read post title',
                  contentExcerpt: 'this is yet another post content',
                  author: {
                    id: 'john-1',
                    slug: 'john-doe',
                    name: 'John Doe',
                  },
                },
              },
            ],
          }
        }
      })

      it('displays the number of unread notifications', () => {
        wrapper = Wrapper()
        expect(wrapper.find('.count').text()).toEqual('2')
      })

      it('renders the counter in red', () => {
        wrapper = Wrapper()
        expect(wrapper.find('.count').classes()).toContain('--danger')
      })
    })
  })
})
