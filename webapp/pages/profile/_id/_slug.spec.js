import { shallowMount, createLocalVue } from '@vue/test-utils'
import ProfileSlug from './_slug.vue'
import Vuex from 'vuex'
import Styleguide from '@human-connection/styleguide'

const localVue = createLocalVue()

localVue.use(Vuex)
localVue.use(Styleguide)

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
      // If you mocking router, than don't use VueRouter with localVue: https://vue-test-utils.vuejs.org/guides/using-with-vue-router.html
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
  })

  describe('shallowMount', () => {
    Wrapper = () => {
      return shallowMount(ProfileSlug, {
        mocks,
        localVue,
      })
    }

    beforeEach(jest.useFakeTimers)

    describe('test mixin "PostMutationHelpers"', () => {
      beforeEach(() => {
        wrapper = Wrapper()
      })

      describe('deletion of Post from List by invoking "deletePostCallback(`list`)"', () => {
        beforeEach(() => {
          wrapper.vm.deletePostCallback('list')
        })

        describe('after timeout', () => {
          beforeEach(jest.runAllTimers)

          it('emits "deletePost"', () => {
            expect(wrapper.emitted().deletePost.length).toBe(1)
          })

          it('does not go to index (main) page', () => {
            expect(mocks.$router.history.push).not.toHaveBeenCalled()
          })

          it('does call mutation', () => {
            expect(mocks.$apollo.mutate).toHaveBeenCalledTimes(1)
          })

          it('mutation is successful', () => {
            expect(mocks.$toast.success).toHaveBeenCalledTimes(1)
          })
        })
      })
    })
  })
})
