import { config, mount, createLocalVue } from '@vue/test-utils'
import CommentList from '.'
import Empty from '~/components/Empty'
import Vue from 'vue'
import Vuex from 'vuex'
import Filters from '~/plugins/vue-filters'
import Styleguide from '@human-connection/styleguide'

const localVue = createLocalVue()

localVue.use(Styleguide)
localVue.use(Vuex)
localVue.filter('truncate', string => string)

config.stubs['v-popover'] = '<span><slot /></span>'
config.stubs['nuxt-link'] = '<span><slot /></span>'
config.stubs['no-ssr'] = '<span><slot /></span>'

describe('CommentList.vue', () => {
  let mocks
  let store
  let wrapper
  let propsData
  let data

  propsData = {
    post: { id: 1 }
  }
  store = new Vuex.Store({
    getters: {
      'auth/user': () => {
        return {}
      }
    }
  })
  mocks = {
    $t: jest.fn()
  }
  data = () => {
    return {
      comments: []
    }
  }

  describe('shallowMount', () => {
    const Wrapper = () => {
      return mount(CommentList, { store, mocks, localVue, propsData, data })
    }

    beforeEach(() => {
      wrapper = Wrapper()
      wrapper.setData({
        comments: [{ id: 'c1', contentExcerpt: 'this is a comment' }]
      })
    })

    it('displays a message icon when there are no comments to display', () => {
      expect(Wrapper().findAll(Empty)).toHaveLength(1)
    })

    it('displays a comments counter', () => {
      expect(wrapper.find('span.ds-tag').text()).toEqual('1')
    })

    it('displays comments when there are comments to display', () => {
      expect(wrapper.find('div#comments').text()).toEqual('this is a comment')
    })
  })
})
