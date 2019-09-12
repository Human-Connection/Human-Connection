import { config, mount, createLocalVue } from '@vue/test-utils'
import CommentList from './CommentList'
import Empty from '~/components/Empty'
import Vuex from 'vuex'
import Styleguide from '@human-connection/styleguide'
import Filters from '~/plugins/vue-filters'

const localVue = createLocalVue()

localVue.use(Styleguide)
localVue.use(Vuex)
localVue.use(Filters)
localVue.filter('truncate', string => string)

config.stubs['v-popover'] = '<span><slot /></span>'
config.stubs['nuxt-link'] = '<span><slot /></span>'
config.stubs['client-only'] = '<span><slot /></span>'

describe('CommentList.vue', () => {
  let mocks
  let store
  let wrapper
  let propsData

  describe('shallowMount', () => {
    beforeEach(() => {
      propsData = {
        post: {
          id: 1,
          createdAt: { formatted: '2019-03-13T11:00:20.835Z' },
          comments: [
            {
              id: 'comment134',
              contentExcerpt: 'this is a comment',
              content: 'this is a comment',
              createdAt: { formatted: '2019-03-13T11:00:20.835Z' },
            },
          ],
        },
      }
      store = new Vuex.Store({
        getters: {
          'auth/isModerator': () => false,
          'auth/user': () => {
            return {}
          },
        },
      })
      mocks = {
        $t: jest.fn(),
        $i18n: {
          locale: () => 'en',
        },
        $filters: {
          truncate: a => a,
        },
        $apollo: {
          queries: {
            Post: {
              refetch: jest.fn(),
            },
          },
        },
      }
    })

    const Wrapper = () => {
      return mount(CommentList, {
        store,
        mocks,
        localVue,
        propsData,
      })
    }

    beforeEach(() => {
      wrapper = Wrapper()
    })

    it('displays a message icon when there are no comments to display', () => {
      propsData.post.comments = []
      expect(Wrapper().findAll(Empty)).toHaveLength(1)
    })

    it('displays a comments counter', () => {
      expect(wrapper.find('span.ds-tag').text()).toEqual('1')
    })

    it('displays comments when there are comments to display', () => {
      expect(wrapper.find('div.comments').text()).toContain('this is a comment')
    })
  })
})
