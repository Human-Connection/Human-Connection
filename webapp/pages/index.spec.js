import { config, shallowMount, mount, createLocalVue } from '@vue/test-utils'
import PostIndex from './index.vue'
import Vuex from 'vuex'
import Styleguide from '@human-connection/styleguide'
import Filters from '~/plugins/vue-filters'
import VTooltip from 'v-tooltip'
import FilterMenu from '~/components/FilterMenu/FilterMenu'
import InfiniteLoading from '~/plugins/vue-infinite-loading'

const localVue = createLocalVue()

localVue.use(Vuex)
localVue.use(Styleguide)
localVue.use(Filters)
localVue.use(VTooltip)
localVue.use(InfiniteLoading)

config.stubs['client-only'] = '<span><slot /></span>'
config.stubs['router-link'] = '<span><slot /></span>'
config.stubs['nuxt-link'] = '<span><slot /></span>'
config.stubs['infinite-loading'] = '<span><slot /></span>'

describe('PostIndex', () => {
  let wrapper
  let Wrapper
  let store
  let mocks
  let mutations

  beforeEach(() => {
    mutations = {
      'posts/SELECT_ORDER': jest.fn(),
    }
    store = new Vuex.Store({
      getters: {
        'posts/filter': () => ({}),
        'posts/orderOptions': () => () => [
          {
            key: 'store.posts.orderBy.oldest.label',
            label: 'store.posts.orderBy.oldest.label',
            icon: 'sort-amount-asc',
            value: 'createdAt_asc',
          },
          {
            key: 'store.posts.orderBy.newest.label',
            label: 'store.posts.orderBy.newest.label',
            icon: 'sort-amount-desc',
            value: 'createdAt_desc',
          },
        ],
        'posts/selectedOrder': () => () => 'createdAt_desc',
        'posts/orderIcon': () => 'sort-amount-desc',
        'posts/orderBy': () => 'createdAt_desc',
        'auth/user': () => {
          return { id: 'u23' }
        },
      },
      mutations,
    })
    mocks = {
      $t: key => key,
      $filters: {
        truncate: a => a,
        removeLinks: jest.fn(),
      },
      $i18n: {
        locale: () => 'de',
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

    it('clears the search when the filter menu emits clearSearch', () => {
      mocks.$route.query.hashtag = '#samplehashtag'
      wrapper = Wrapper()
      wrapper.find(FilterMenu).vm.$emit('clearSearch')
      expect(wrapper.vm.hashtag).toBeNull()
    })

    describe('mount', () => {
      beforeEach(() => {
        wrapper = mount(PostIndex, {
          store,
          mocks,
          localVue,
        })
      })

      it('calls store when using order by menu', () => {
        wrapper
          .findAll('li')
          .at(0)
          .trigger('click')
        expect(mutations['posts/SELECT_ORDER']).toHaveBeenCalledWith({}, 'createdAt_asc')
      })

      it('updates offset when a user clicks on the load more button', () => {
        wrapper.find('.load-more button').trigger('click')
        expect(wrapper.vm.offset).toEqual(12)
      })
    })
  })
})
