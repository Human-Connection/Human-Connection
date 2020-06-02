import { mount } from '@vue/test-utils'

import PaginationButtons from './PaginationButtons'

const localVue = global.localVue

describe('PaginationButtons.vue', () => {
  const propsData = {}
  let wrapper
  const mocks = {
    $t: jest.fn(),
  }

  const Wrapper = () => {
    return mount(PaginationButtons, { mocks, propsData, localVue })
  }

  describe('mount', () => {
    describe('next button', () => {
      beforeEach(() => {
        wrapper = Wrapper()
      })

      it('is disabled by default', () => {
        expect(wrapper.find('.next-button').exists()).toEqual(false)
      })

      it('is enabled if hasNext is true', async () => {
        wrapper.setProps({ hasMoreResults: true })
        await wrapper.vm.$nextTick()
        expect(wrapper.find('.next-button').exists()).toEqual(true)
      })

      it('emits next when clicked', async () => {
        wrapper.setProps({ hasMoreResults: true })
        await wrapper.vm.$nextTick()
        wrapper.find('.next-button').trigger('click')
        await wrapper.vm.$nextTick()
        expect(wrapper.emitted().next).toHaveLength(1)
      })
    })

    describe('back button', () => {
      beforeEach(() => {
        wrapper = Wrapper()
      })

      it('is disabled by default', () => {
        expect(wrapper.find('.previous-button').exists()).toEqual(false)
      })

      it('is enabled if hasPrevious is true', async () => {
        wrapper.setProps({ hasPreviousResult: true })
        await wrapper.vm.$nextTick()
        expect(wrapper.find('.previous-button').exists()).toEqual(true)
      })

      it('emits back when clicked', async () => {
        wrapper.setProps({ hasPreviousResult: true })
        await wrapper.vm.$nextTick()
        wrapper.find('.previous-button').trigger('click')
        await wrapper.vm.$nextTick()
        expect(wrapper.emitted().back).toHaveLength(1)
      })
    })
  })
})
