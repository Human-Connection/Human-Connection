import { shallowMount } from '@vue/test-utils'
import Upload from '.'

describe('Upload', () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(Upload, {})
  })

  it('renders', () => {
    expect(wrapper.is('div')).toBe(true)
  })

  // TODO: add more test cases in this file
})
