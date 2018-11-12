import { shallowMount } from '@vue/test-utils'
import Badges from './Badges.vue'

describe('Badges.vue', () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(Badges, {
    })
  })

  it('renders', () => {
    expect(wrapper.is('div')).toBe(true)
  })

  it('has class "hc-badges"', () => {
    expect(wrapper.contains('.hc-badges')).toBe(true)
  })

  // TODO: add similar software tests for other components
  // TODO: add more test cases in this file
})
