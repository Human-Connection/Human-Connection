import { mount, createLocalVue } from '@vue/test-utils'
import Styleguide from '@human-connection/styleguide'
import MasonryGrid from './MasonryGrid'

const localVue = createLocalVue()
localVue.use(Styleguide)

describe('MasonryGrid', () => {
  let wrapper
  let masonryGrid

  beforeEach(() => {
    wrapper = mount(MasonryGrid, { localVue })
    masonryGrid = wrapper.vm.$children[0]
  })

  it('adds the "reset-grid-height" class when one or more children are updating', () => {
    masonryGrid.$emit('calculating-item-height')

    expect(wrapper.classes()).toContain('reset-grid-height')
  })

  it('removes the "reset-grid-height" class when all children have completed updating', () => {
    wrapper.setData({ itemsCalculating: 1 })
    masonryGrid.$emit('finished-calculating-item-height')

    expect(wrapper.classes()).not.toContain('reset-grid-height')
  })
})
