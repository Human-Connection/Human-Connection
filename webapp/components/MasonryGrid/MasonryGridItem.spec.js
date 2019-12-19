import { config, mount } from '@vue/test-utils'
import MasonryGridItem from './MasonryGridItem'

const localVue = global.localVue

config.stubs['ds-grid-item'] = '<span><slot /></span>'

describe('MasonryGridItem', () => {
  let wrapper

  describe('given an imageAspectRatio', () => {
    it('sets the initial rowSpan to 13 when the ratio is higher than 1.3', () => {
      const propsData = { imageAspectRatio: 2 }
      wrapper = mount(MasonryGridItem, { localVue, propsData })

      expect(wrapper.vm.rowSpan).toBe(13)
    })

    it('sets the initial rowSpan to 15 when the ratio is between 1.3 and 1', () => {
      const propsData = { imageAspectRatio: 1.1 }
      wrapper = mount(MasonryGridItem, { localVue, propsData })

      expect(wrapper.vm.rowSpan).toBe(15)
    })

    it('sets the initial rowSpan to 18 when the ratio is between 1 and 0.7', () => {
      const propsData = { imageAspectRatio: 0.7 }
      wrapper = mount(MasonryGridItem, { localVue, propsData })

      expect(wrapper.vm.rowSpan).toBe(18)
    })

    it('sets the initial rowSpan to 25 when the ratio is lower than 0.7', () => {
      const propsData = { imageAspectRatio: 0.3 }
      wrapper = mount(MasonryGridItem, { localVue, propsData })
      expect(wrapper.vm.rowSpan).toBe(25)
    })

    describe('given no aspect ratio', () => {
      it('sets the initial rowSpan to 8 when not given an imageAspectRatio', () => {
        wrapper = mount(MasonryGridItem, { localVue })
        expect(wrapper.vm.rowSpan).toBe(8)
      })
    })
  })
})
