import { config, mount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import VTooltip from 'v-tooltip'
import Styleguide from '@human-connection/styleguide'
import AvatarMenu from './AvatarMenu.vue'
import Filters from '~/plugins/vue-filters'

const localVue = createLocalVue()
localVue.use(Styleguide)
localVue.use(Vuex)
localVue.use(Filters)
localVue.use(VTooltip)

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
      $t: jest.fn(a => a),
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

    it('renders the HcAvatar component', () => {
      wrapper.find('.avatar-menu-trigger').trigger('click')
      expect(wrapper.find('.ds-avatar').exists()).toBe(true)
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

    describe('routes', () => {
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
          const profileLink = wrapper.findAll('.ds-menu-item span').at(0)
          expect(profileLink.attributes().to).toEqual('/profile/u343/matt')
        })

        it('displays a link to the notifications page', () => {
          const notificationsLink = wrapper.findAll('.ds-menu-item span').at(2)
          expect(notificationsLink.attributes().to).toEqual('/notifications')
        })

        it('displays a link to the settings page', () => {
          const settingsLink = wrapper.findAll('.ds-menu-item span').at(4)
          expect(settingsLink.attributes().to).toEqual('/settings')
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
          const moderationLink = wrapper.findAll('.ds-menu-item span').at(6)
          expect(moderationLink.attributes().to).toEqual('/moderation')
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
          const adminLink = wrapper.findAll('.ds-menu-item span').at(8)
          expect(adminLink.attributes().to).toEqual('/admin')
        })
      })
    })
  })
})
