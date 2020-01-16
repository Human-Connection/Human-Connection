import { mount } from '@vue/test-utils'

import PaginationButtons from './PaginationButtons'

const localVue = global.localVue

describe('PaginationButtons.vue', () => {
  let propsData = {}
  let wrapper
  let nextButton
  let backButton

  const Wrapper = () => {
    return mount(PaginationButtons, { propsData, localVue })
  }

  describe('mount', () => {
    describe('next button', () => {
      beforeEach(() => {
        propsData.hasNext = true
        wrapper = Wrapper()
        nextButton = wrapper.find('[data-test="next-button"]')
      })

      it('is disabled by default', () => {
        propsData = {}
        wrapper = Wrapper()
        nextButton = wrapper.find('[data-test="next-button"]')
        expect(nextButton.attributes().disabled).toEqual('disabled')
      })

      it('is enabled if hasNext is true', () => {
        expect(nextButton.attributes().disabled).toBeUndefined()
      })

      it('emits next when clicked', async () => {
        await nextButton.trigger('click')
        expect(wrapper.emitted().next).toHaveLength(1)
      })
    })

    describe('back button', () => {
      beforeEach(() => {
        propsData.hasPrevious = true
        wrapper = Wrapper()
        backButton = wrapper.find('[data-test="previous-button"]')
      })

      it('is disabled by default', () => {
        propsData = {}
        wrapper = Wrapper()
        backButton = wrapper.find('[data-test="previous-button"]')
        expect(backButton.attributes().disabled).toEqual('disabled')
      })

      it('is enabled if hasPrevious is true', () => {
        expect(backButton.attributes().disabled).toBeUndefined()
      })

      it('emits back when clicked', async () => {
        await backButton.trigger('click')
        expect(wrapper.emitted().back).toHaveLength(1)
      })
    })
  })
})
