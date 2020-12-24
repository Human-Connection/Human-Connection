import { config, mount } from '@vue/test-utils'
import Vuex from 'vuex'
import AvatarMenu from './AvatarMenu.vue'

const localVue = global.localVue

config.stubs['nuxt-link'] = '<span><slot /></span>'
config.stubs['router-link'] = '<span><slot /></span>'

describe('AvatarMenu.vue', () => {
  let propsData, getters, wrapper, mocks

  beforeEach(() => {
    propsData = {}
    mocks = {
      $route: {
        path: '',
      },
      $router: {
        resolve: jest.fn(() => {
          return { href: '/profile/u343/matt' }
        }),
      },
      $t: jest.fn((a) => a),
    }
    getters = {
      'auth/user': () => {
        return { id: 'u343', name: 'Matt' }
      },
    }
  })

  const Wrapper = () => {
    const store = new Vuex.Store({
      getters,
    })
    return mount(AvatarMenu, { propsData, localVue, store, mocks })
  }

  describe('mount', () => {
    beforeEach(() => {
      wrapper = Wrapper()
    })

    it('renders the UserAvatar component', () => {
      wrapper.find('.avatar-menu-trigger').trigger('click')
      expect(wrapper.find('.user-avatar').exists()).toBe(true)
    })

    describe('given a userName', () => {
      it('displays the userName', () => {
        expect(wrapper.find('b').text()).toEqual('Matt')
      })
    })

    describe('no userName', () => {
      beforeEach(() => {
        getters = {
          'auth/user': () => {
            return { id: 'u343' }
          },
        }
        wrapper = Wrapper()
        wrapper.find('.avatar-menu-trigger').trigger('click')
      })

      it('displays anonymous user', () => {
        expect(wrapper.find('b').text()).toEqual('profile.userAnonym')
      })
    })

    describe('menu items', () => {
      beforeEach(() => {
        getters = {
          'auth/user': () => {
            return { id: 'u343', slug: 'matt' }
          },
          'auth/isModerator': () => false,
          'auth/isAdmin': () => false,
        }
        wrapper = Wrapper()
        wrapper.find('.avatar-menu-trigger').trigger('click')
      })

      describe('role user', () => {
        it('displays a link to user profile', () => {
          const profileLink = wrapper
            .findAll('.ds-menu-item span')
            .at(wrapper.vm.routes.findIndex((route) => route.path === '/profile/u343/matt'))
          expect(profileLink.exists()).toBe(true)
        })

        it('displays a link to the notifications page', () => {
          const notificationsLink = wrapper
            .findAll('.ds-menu-item span')
            .at(wrapper.vm.routes.findIndex((route) => route.path === '/notifications'))
          expect(notificationsLink.exists()).toBe(true)
        })

        it('displays a link to the settings page', () => {
          const settingsLink = wrapper
            .findAll('.ds-menu-item span')
            .at(wrapper.vm.routes.findIndex((route) => route.path === '/settings'))
          expect(settingsLink.exists()).toBe(true)
        })

        it('displays a link to the organization list page', () => {
          const settingsLink = wrapper
            .findAll('.ds-menu-item span')
            .at(wrapper.vm.routes.findIndex((route) => route.path === '/organization/list'))
          expect(settingsLink.exists()).toBe(true)
        })
      })

      describe('role moderator', () => {
        beforeEach(() => {
          getters = {
            'auth/user': () => {
              return { id: 'u343', slug: 'matt' }
            },
            'auth/isModerator': () => true,
            'auth/isAdmin': () => false,
          }
          wrapper = Wrapper()
          wrapper.find('.avatar-menu-trigger').trigger('click')
        })

        it('displays a link to moderation page', () => {
          const moderationLink = wrapper
            .findAll('.ds-menu-item span')
            .at(wrapper.vm.routes.findIndex((route) => route.path === '/moderation'))
          expect(moderationLink.exists()).toBe(true)
        })

        it('displays a total of 5 links', () => {
          const allLinks = wrapper.findAll('.ds-menu-item')
          expect(allLinks).toHaveLength(5)
        })
      })

      describe('role admin', () => {
        beforeEach(() => {
          getters = {
            'auth/user': () => {
              return { id: 'u343', slug: 'matt' }
            },
            'auth/isModerator': () => true,
            'auth/isAdmin': () => true,
          }
          wrapper = Wrapper()
          wrapper.find('.avatar-menu-trigger').trigger('click')
        })

        it('displays a link to admin page', () => {
          const adminLink = wrapper
            .findAll('.ds-menu-item span')
            .at(wrapper.vm.routes.findIndex((route) => route.path === '/admin'))
          expect(adminLink.exists()).toBe(true)
        })

        it('displays a total of 6 links', () => {
          const allLinks = wrapper.findAll('.ds-menu-item')
          expect(allLinks).toHaveLength(6)
        })
      })
    })
  })
})
