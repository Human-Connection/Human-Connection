import { config, shallowMount, createLocalVue } from '@vue/test-utils'
import Styleguide from '@human-connection/styleguide'
import MasonryGridItem from './MasonryGridItem'

const localVue = createLocalVue()
localVue.use(Styleguide)

config.stubs['ds-grid-item'] = '<span><slot /></span>'

describe('MasonryGridItem', () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(MasonryGridItem, { localVue })
    wrapper.vm.$parent.$emit = jest.fn()
  })

  it('emits "calculating-item-height" when starting calculation', async () => {
    wrapper.vm.calculateItemHeight()
    await wrapper.vm.$nextTick()

    const firstCallArgument = wrapper.vm.$parent.$emit.mock.calls[0][0]
    expect(firstCallArgument).toBe('calculating-item-height')
  })

  it('emits "finished-calculating-item-height" after the calculation', async () => {
    wrapper.vm.calculateItemHeight()
    await wrapper.vm.$nextTick()

    const secondCallArgument = wrapper.vm.$parent.$emit.mock.calls[1][0]
    expect(secondCallArgument).toBe('finished-calculating-item-height')
  })
})
