import { config, mount } from '@vue/test-utils'
import ProfileSlug from './_slug.vue'

const localVue = global.localVue

localVue.filter('date', (d) => d)

config.stubs['client-only'] = '<span><slot /></span>'
config.stubs['v-popover'] = '<span><slot /></span>'
config.stubs['nuxt-link'] = '<span><slot /></span>'
config.stubs['infinite-loading'] = '<span><slot /></span>'
config.stubs['follow-list'] = '<span><slot /></span>'

describe('ProfileSlug', () => {
  let wrapper
  let Wrapper
  let mocks

  beforeEach(() => {
    mocks = {
      post: {
        id: 'p23',
        name: 'It is a post',
      },
      $t: jest.fn(),
      // If you're mocking router, then don't use VueRouter with localVue: https://vue-test-utils.vuejs.org/guides/using-with-vue-router.html
      $route: {
        params: {
          id: '4711',
          slug: 'john-doe',
        },
      },
      $router: {
        history: {
          push: jest.fn(),
        },
      },
      $toast: {
        success: jest.fn(),
        error: jest.fn(),
      },
      $apollo: {
        loading: false,
        mutate: jest.fn().mockResolvedValue(),
      },
    }
  })

  describe('mount', () => {
    Wrapper = () => {
      return mount(ProfileSlug, {
        mocks,
        localVue,
      })
    }

    describe('given an authenticated user', () => {
      beforeEach(() => {
        mocks.$filters = {
          removeLinks: (c) => c,
          truncate: (a) => a,
        }
        mocks.$store = {
          getters: {
            'auth/isModerator': () => false,
            'auth/user': {
              id: 'u23',
            },
          },
        }
      })

      describe('given a user for the profile', () => {
        beforeEach(() => {
          wrapper = Wrapper()
          wrapper.setData({
            User: [
              {
                id: 'u3',
                name: 'Bob the builder',
                contributionsCount: 6,
                shoutedCount: 7,
                commentedCount: 8,
              },
            ],
          })
        })

        it('displays name of the user', () => {
          expect(wrapper.text()).toContain('Bob the builder')
        })
      })
    })
  })
})
