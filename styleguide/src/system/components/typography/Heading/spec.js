import { shallowMount } from '@vue/test-utils'
import Comp from './Heading.vue'

describe('Heading.vue', () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(Comp, {
      slots: {
        default: 'Winter is coming'
      }
    })
  })

  it('defaults to h1', () => {
    expect(wrapper.props().tag).toEqual('h1')
  })

  it('displays title', () => {
    expect(wrapper.text()).toEqual('Winter is coming')
  })

  it('matches snapshot', () => {
    expect(wrapper.element).toMatchSnapshot()
  })
})