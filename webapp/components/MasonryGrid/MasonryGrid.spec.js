import { shallowMount } from '@vue/test-utils'
import MasonryGrid from './MasonryGrid'

describe('MasonryGrid', () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(MasonryGrid)
  })

  it('adds the "reset-grid-height" class when one or more children are updating', () => {
    wrapper.trigger('calculating-item-height')

    expect(wrapper.classes()).toContain('reset-grid-height')
  })

  it('removes the "reset-grid-height" class when all children have completed updating', () => {
    wrapper.setData({ itemsCalculating: 1 })
    wrapper.trigger('finished-calculating-item-height')

    expect(wrapper.classes()).not.toContain('reset-grid-height')
  })
})
