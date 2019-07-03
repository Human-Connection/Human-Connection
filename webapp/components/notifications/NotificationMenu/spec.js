import { config, shallowMount, createLocalVue } from '@vue/test-utils'
import NotificationMenu from '.'

import Styleguide from '@human-connection/styleguide'
import Filters from '~/plugins/vue-filters'

const localVue = createLocalVue()

localVue.use(Styleguide)
localVue.use(Filters)
localVue.filter('truncate', string => string)

config.stubs['dropdown'] = '<span class="dropdown"><slot /></span>'

describe('NotificationMenu.vue', () => {
  let wrapper
  let mocks
  let data
  beforeEach(() => {
    mocks = {
      $t: jest.fn(),
    }
    data = () => {
      return {
        notifications: [],
      }
    }
  })

  describe('shallowMount', () => {
    const Wrapper = () => {
      return shallowMount(NotificationMenu, {
        data,
        mocks,
        localVue,
      })
    }

    it('counter displays 0', () => {
      wrapper = Wrapper()
      expect(wrapper.find('ds-button-stub').text()).toEqual('0')
    })

    it('no dropdown is rendered', () => {
      wrapper = Wrapper()
      expect(wrapper.contains('.dropdown')).toBe(false)
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
            ],
          }
        }
      })

      it('displays the total number of notifications', () => {
        wrapper = Wrapper()
        expect(wrapper.find('ds-button-stub').text()).toEqual('2')
      })
    })
  })
})
