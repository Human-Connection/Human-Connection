import { mount } from '@vue/test-utils'
import Vue from 'vue'
import MasonryGrid from './MasonryGrid'

const localVue = global.localVue

describe('MasonryGrid', () => {
  let wrapper
  let masonryGridItem

  beforeEach(() => {
    wrapper = mount(MasonryGrid, { localVue })
    masonryGridItem = wrapper.vm.$children[0]
  })

  it('adds the "reset-grid-height" class when itemsCalculating is more than 0', async () => {
    wrapper.setData({ itemsCalculating: 1 })
    await Vue.nextTick()
    expect(wrapper.classes()).toContain('reset-grid-height')
  })

  it('removes the "reset-grid-height" class when itemsCalculating is 0', async () => {
    wrapper.setData({ itemsCalculating: 0 })
    await Vue.nextTick()
    expect(wrapper.classes()).not.toContain('reset-grid-height')
  })

  it('adds 1 to itemsCalculating when a child emits "calculating-item-height"', async () => {
    wrapper.setData({ itemsCalculating: 0 })
    masonryGridItem.$emit('calculating-item-height')
    await Vue.nextTick()
    expect(wrapper.vm.itemsCalculating).toBe(1)
  })

  it('subtracts 1 from itemsCalculating when a child emits "finished-calculating-item-height"', async () => {
    wrapper.setData({ itemsCalculating: 2 })
    masonryGridItem.$emit('finished-calculating-item-height')
    await Vue.nextTick()
    expect(wrapper.vm.itemsCalculating).toBe(1)
  })
})
