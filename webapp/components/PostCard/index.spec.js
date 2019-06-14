import { config, shallowMount, mount, createLocalVue, RouterLinkStub } from '@vue/test-utils'
import Styleguide from '@human-connection/styleguide'
import Vuex from 'vuex'
import Filters from '~/plugins/vue-filters'
import PostCard from '.'

const localVue = createLocalVue()

localVue.use(Vuex)
localVue.use(Styleguide)
localVue.use(Filters)

config.stubs['no-ssr'] = '<span><slot /></span>'
config.stubs['v-popover'] = '<span><slot /></span>'

describe('PostCard', () => {
  let store
  let stubs
  let mocks
  let propsData
  let getters
  let Wrapper
  let wrapper

  beforeEach(() => {
    propsData = {
      post: {
        id: 'p23',
        name: 'It is a post',
        author: {
          id: 'u1',
        },
        disabled: false,
      },
    }
    store = new Vuex.Store({
      getters: {
        'auth/user': () => {
          return {}
        },
      },
    })
    stubs = {
      NuxtLink: RouterLinkStub,
    }
    mocks = {
      $t: jest.fn(),
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
        return {}
      },
    }
  })

  describe('shallowMount', () => {
    Wrapper = () => {
      return shallowMount(PostCard, {
        store,
        propsData,
        mocks,
        localVue,
      })
    }

    beforeEach(jest.useFakeTimers)

    describe('test Post callbacks', () => {
      beforeEach(() => {
        wrapper = Wrapper()
      })

      describe('deletion of Post from Page by invoking "deletePostCallback()"', () => {
        beforeEach(() => {
          wrapper.vm.deletePostCallback()
        })

        describe('after timeout', () => {
          beforeEach(jest.runAllTimers)

          it('does call mutation', () => {
            expect(mocks.$apollo.mutate).toHaveBeenCalledTimes(1)
          })

          it('mutation is successful', () => {
            expect(mocks.$toast.success).toHaveBeenCalledTimes(1)
          })

          it('emits "removePostFromList"', () => {
            expect(wrapper.emitted().removePostFromList).toHaveLength(1)
          })
        })
      })
    })
  })

  describe('mount', () => {
    Wrapper = () => {
      const store = new Vuex.Store({
        getters,
      })
      return mount(PostCard, {
        stubs,
        mocks,
        propsData,
        store,
        localVue,
      })
    }

    describe('given a post', () => {
      beforeEach(() => {
        propsData.post = {
          title: "It's a title",
        }
      })

      it('renders title', () => {
        expect(Wrapper().text()).toContain("It's a title")
      })
    })
  })
})
