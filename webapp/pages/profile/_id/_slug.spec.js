import { config, mount } from '@vue/test-utils'
import ProfileSlug from './_slug.vue'

const localVue = global.localVue

localVue.filter('date', d => d)

config.stubs['client-only'] = '<span><slot /></span>'
config.stubs['v-popover'] = '<span><slot /></span>'
config.stubs['nuxt-link'] = '<span><slot /></span>'
config.stubs['infinite-loading'] = '<span><slot /></span>'

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
      $t: jest.fn(a => a),
      $filters: {
        date: jest.fn(a => a),
      },
      // If you're mocking router, then don't use VueRouter with localVue: https://vue-test-utils.vuejs.org/guides/using-with-vue-router.html
      $route: {
        params: {
          id: 'f26bc193-605d-4465-994e-c2f328d9db01',
          slug: 'bob-the-builder',
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
          removeLinks: c => c,
          truncate: a => a,
        }
        mocks.$store = {
          getters: {
            'auth/isModerator': () => false,
            'auth/user': {
              id: 'f26bc193-605d-4465-994e-c2f328d9db01',
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
                id: 'f26bc193-605d-4465-994e-c2f328d9db01',
                name: 'Bob the builder',
                slug: 'bob-the-builder',
                createdAt: '2020-01-23T06:38:58.813Z',
                about: 'Oh! I am so excited about me and myself …',
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

        it('displays slug of the user', () => {
          expect(wrapper.text()).toContain('@bob-the-builder')
        })

        describe('member since', () => {
          it('displays description identifier', () => {
            expect(wrapper.text()).toContain('profile.memberSince')
          })

          it('date', () => {
            expect(wrapper.text()).toContain('2020-01-23T06:38:58.813Z')
          })
        })

        it('displays about of the user', () => {
          expect(wrapper.text()).toContain('Oh! I am so excited about me and myself …')
        })

        describe('user ID', () => {
          it('displays description identifier', () => {
            expect(wrapper.text()).toContain('profile.userId')
          })

          it('displays ID', () => {
            expect(wrapper.text()).toContain('f26bc193-605d-4465-994e-c2f328d9db01')
          })
        })
      })
    })
  })
})
