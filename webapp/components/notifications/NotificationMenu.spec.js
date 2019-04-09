import { config, shallowMount, createLocalVue } from '@vue/test-utils'
import NotificationMenu from './NotificationMenu.vue'

import Styleguide from '@human-connection/styleguide'

const localVue = createLocalVue()

localVue.use(Styleguide)
localVue.filter('truncate', string => string)

config.stubs['dropdown'] = '<span><slot /></span>'

describe('NotificationMenu.vue', () => {
  let wrapper
  let Wrapper
  let mocks
  let data

  beforeEach(() => {
    mocks = {
      $t: jest.fn()
    }
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
                name: 'John Doe'
              }
            }
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
                name: 'John Doe'
              }
            }
          }
        ]
      }
    }
  })

  describe('shallowMount', () => {
    const Wrapper = () => {
      return shallowMount(NotificationMenu, {
        data,
        mocks,
        localVue
      })
    }

    beforeEach(() => {
      wrapper = Wrapper()
    })

    it('displays the total number of notifications', () => {
      expect(wrapper.find('ds-button-stub').text()).toEqual('2')
    })
  })
})
