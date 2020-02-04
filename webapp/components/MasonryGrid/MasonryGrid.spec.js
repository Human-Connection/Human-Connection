import { mount } from '@vue/test-utils'

import MasonryGrid from './MasonryGrid'

const localVue = global.localVue

describe('MasonryGrid', () => {
  let wrapper
  let masonryGridItem

  beforeEach(() => {
    wrapper = mount(MasonryGrid, { localVue })
    masonryGridItem = wrapper.vm.$children[0]
  })

  it('adds the "reset-grid-height" class when itemsCalculating is more than 0', () => {
    wrapper.setData({ itemsCalculating: 1 })

    expect(wrapper.classes()).toContain('ds-grid')
  })

  it('removes the "reset-grid-height" class when itemsCalculating is 0', () => {
    wrapper.setData({ itemsCalculating: 0 })

    expect(wrapper.classes()).not.toContain('reset-grid-height')
  })

  it('adds 1 to itemsCalculating when a child emits "calculating-item-height"', () => {
    wrapper.setData({ itemsCalculating: 0 })
    masonryGridItem.$emit('calculating-item-height')

    expect(wrapper.vm.itemsCalculating).toBe(1)
  })

  it('subtracts 1 from itemsCalculating when a child emits "finished-calculating-item-height"', () => {
    wrapper.setData({ itemsCalculating: 2 })
    masonryGridItem.$emit('finished-calculating-item-height')

    expect(wrapper.vm.itemsCalculating).toBe(1)
  })
})
