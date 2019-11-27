import { config, mount } from '@vue/test-utils'
import MasonryGridItem from './MasonryGridItem'

const localVue = global.localVue

config.stubs['ds-grid-item'] = '<span><slot /></span>'

describe('MasonryGridItem', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(MasonryGridItem, { localVue })
  })

  it('parent emits "calculating-item-height" when starting calculation', async () => {
    wrapper.vm.calculateItemHeight()
    await wrapper.vm.$nextTick()

    const firstEmittedFunction = wrapper.vm.$parent.__emittedByOrder[0]
    expect(firstEmittedFunction.name).toBe('calculating-item-height')
  })

  it('parent emits "finished-calculating-item-height" after the calculation', async () => {
    wrapper.vm.calculateItemHeight()
    await wrapper.vm.$nextTick()

    const secondEmittedFunction = wrapper.vm.$parent.__emittedByOrder[1]
    expect(secondEmittedFunction.name).toBe('finished-calculating-item-height')
  })
})
