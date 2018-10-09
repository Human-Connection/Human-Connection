import { shallowMount } from '@vue/test-utils'
import Comp from './CopyField.vue'

describe('CopyField.vue', () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(Comp, {
      slots: {
        default: 'Test'
      }
    })
  })

  it('defaults to div', () => {
    expect(wrapper.props().tag).toEqual('div')
  })

  it('displays text', () => {
    expect(wrapper.text()).toEqual('Test')
  })

  it('matches snapshot', () => {
    expect(wrapper.element).toMatchSnapshot()
  })
})