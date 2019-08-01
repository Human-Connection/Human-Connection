import { config, shallowMount, mount, createLocalVue } from '@vue/test-utils'
import PostIndex from './index.vue'
import Vuex from 'vuex'
import Styleguide from '@human-connection/styleguide'
import Filters from '~/plugins/vue-filters'
import VTooltip from 'v-tooltip'
import FilterMenu from '~/components/FilterMenu/FilterMenu'

const localVue = createLocalVue()

localVue.use(Vuex)
localVue.use(Styleguide)
localVue.use(Filters)
localVue.use(VTooltip)

config.stubs['no-ssr'] = '<span><slot /></span>'
config.stubs['router-link'] = '<span><slot /></span>'
config.stubs['nuxt-link'] = '<span><slot /></span>'

describe('PostIndex', () => {
  let wrapper
  let Wrapper
  let store
  let mocks

  beforeEach(() => {
    store = new Vuex.Store({
      getters: {
        'posts/posts': () => {
          return [
            {
              id: 'p23',
              name: 'It is a post',
              author: {
                id: 'u1',
              },
            },
          ]
        },
        'auth/user': () => {
          return { id: 'u23' }
        },
      },
    })
    mocks = {
      $t: key => key,
      $filters: {
        truncate: a => a,
        removeLinks: jest.fn(),
      },
      // If you are mocking router, than don't use VueRouter with localVue: https://vue-test-utils.vuejs.org/guides/using-with-vue-router.html
      $router: {
        history: {
          push: jest.fn(),
        },
        push: jest.fn(),
      },
      $toast: {
        success: jest.fn(),
        error: jest.fn(),
      },
      $apollo: {
        mutate: jest.fn().mockResolvedValue(),
        queries: {
          Post: {
            refetch: jest.fn(),
            fetchMore: jest.fn().mockResolvedValue([
              {
                id: 'p23',
                name: 'It is a post',
                author: {
                  id: 'u1',
                },
              },
            ]),
          },
        },
      },
      $route: {
        query: {},
      },
    }
  })

  describe('shallowMount', () => {
    Wrapper = () => {
      return shallowMount(PostIndex, {
        store,
        mocks,
        localVue,
      })
    }

    beforeEach(() => {
      wrapper = Wrapper()
    })

    it('refetches Posts when changeFilterBubble is emitted', () => {
      wrapper.find(FilterMenu).vm.$emit('changeFilterBubble')
      expect(mocks.$apollo.queries.Post.refetch).toHaveBeenCalledTimes(1)
    })

    it('clears the search when the filter menu emits clearSearch', () => {
      wrapper.find(FilterMenu).vm.$emit('clearSearch')
      expect(wrapper.vm.hashtag).toBeNull()
    })

    it('calls the changeFilterBubble if there are hasthags in the route query', () => {
      mocks.$route.query.hashtag = { id: 'hashtag' }
      wrapper = Wrapper()
      expect(mocks.$apollo.queries.Post.refetch).toHaveBeenCalledTimes(1)
    })

    describe('mount', () => {
      beforeEach(() => {
        wrapper = mount(PostIndex, {
          store,
          mocks,
          localVue,
        })
      })

      it('sets the post in the store when there are posts', () => {
        wrapper
          .findAll('li')
          .at(0)
          .trigger('click')
        expect(wrapper.vm.sorting).toEqual('createdAt_desc')
      })

      it('loads more posts when a user clicks on the load more button', () => {
        wrapper
          .findAll('button')
          .at(2)
          .trigger('click')
        expect(mocks.$apollo.queries.Post.fetchMore).toHaveBeenCalledTimes(1)
      })
    })
  })
})
