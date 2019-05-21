import { shallowMount, createLocalVue } from '@vue/test-utils'
import Upload from '.'
import Vuex from 'vuex'
import Styleguide from '@human-connection/styleguide'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(Styleguide)

describe('Upload', () => {
  let wrapper
  let propsData

  propsData = {
    user: {
      avatar: '/api/avatar.jpg'
    }
  }

  beforeEach(() => {
    wrapper = shallowMount(Upload, { localVue, propsData })
  })

  it('renders', () => {
    expect(wrapper.is('div')).toBe(true)
  })

  // TODO: add more test cases in this file
})
