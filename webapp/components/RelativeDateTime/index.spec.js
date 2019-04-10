import { shallowMount } from '@vue/test-utils'
import RelativeDateTime from './index.vue'

describe('RelativeDateTime', () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(RelativeDateTime, {})
  })

  it('renders', () => {
    console.log(wrapper.html())
    expect(wrapper.is('div')).toBe(true)
  })
})
