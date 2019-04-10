import { shallowMount } from '@vue/test-utils'
import Editor from './Editor.vue'

describe('Editor.vue', () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(Editor, {})
  })

  it('renders', () => {
    expect(wrapper.is('div')).toBe(true)
  })
})
