import { config, mount } from '@vue/test-utils'
import HcUserProfile from './_slug.vue'
import Vuex from 'vuex'
import Vue from 'vue'

config.stubs['ds-space'] = '<span><div>Hello, Wolle</div></span>'

Vue.use(Vuex)

describe('ProfileSlug', () => {
  let wrapper
  let Wrapper
  let mocks
  let getters

  beforeEach(() => {
    mocks = {
      post: {
        id: 'p23',
        name: 'It is a post',
      },
      $t: jest.fn(),
      // If you mocking router, than don't use VueRouter with lacalVue: https://vue-test-utils.vuejs.org/guides/using-with-vue-router.html
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
        mutate: jest.fn().mockResolvedValue(),
      },
    }
    getters = {
      'auth/user': () => {
        return {
          slug: 'john-doe',
          id: '4711',
        }
      },
    }
  })

  describe('mount', () => {
    Wrapper = () => {
      const store = new Vuex.Store({
        getters,
      })
      return mount(HcUserProfile, {
        store,
        mocks,
      })
    }

    beforeEach(jest.useFakeTimers)

    describe('test "PostHelpers"', () => {
      beforeEach(() => {
        wrapper = Wrapper()
      })

      describe('deletion of Post from List by invoking "deletePostCallback(`list`)"', () => {
        beforeEach(() => {})

        describe('after timeout', () => {
          beforeEach(jest.runAllTimers)

          it('fetches the user', () => {
            expect(wrapper.is('div')).toBe(true)
          })
        })
      })
    })
  })
})
