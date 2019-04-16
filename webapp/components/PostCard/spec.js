import { config, mount, createLocalVue, RouterLinkStub } from '@vue/test-utils'
import PostCard from '.'
import Styleguide from '@human-connection/styleguide'
import Vuex from 'vuex'

const localVue = createLocalVue()

localVue.use(Vuex)
localVue.use(Styleguide)

config.stubs['no-ssr'] = '<span><slot /></span>'
config.stubs['v-popover'] = '<span><slot /></span>'

describe('PostCard', () => {
  let wrapper
  let stubs
  let mocks
  let propsData
  let getters

  beforeEach(() => {
    propsData = {}
    stubs = {
      NuxtLink: RouterLinkStub
    }
    mocks = {
      $t: jest.fn()
    }
    getters = {
      'auth/user': () => {
        return {}
      }
    }
  })

  const Wrapper = () => {
    const store = new Vuex.Store({
      getters
    })
    return mount(PostCard, {
      stubs,
      mocks,
      propsData,
      store,
      localVue
    })
  }

  describe('given a post', () => {
    beforeEach(() => {
      propsData.post = {
        title: "It's a title"
      }
    })

    it('renders title', () => {
      expect(Wrapper().text()).toContain("It's a title")
    })
  })
})
