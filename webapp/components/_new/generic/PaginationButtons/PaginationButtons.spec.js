import { mount } from '@vue/test-utils'

import PaginationButtons from './PaginationButtons'

const localVue = global.localVue

describe('PaginationButtons.vue', () => {
  const propsData = {
    showPageCounter: true,
    activePage: 1,
    activeResourceCount: 57,
  }
  let wrapper
  const mocks = {
    $t: jest.fn(),
  }

  const Wrapper = () => {
    return mount(PaginationButtons, { mocks, propsData, localVue })
  }

  describe('mount', () => {
    beforeEach(() => {
      wrapper = Wrapper()
    })

    describe('next button', () => {
      it('is disabled by default', () => {
        const nextButton = wrapper.find('[data-test="next-button"]')
        expect(nextButton.attributes().disabled).toEqual('disabled')
      })

      it('is enabled if hasNext is true', async () => {
        wrapper.setProps({ hasNext: true })
        await wrapper.vm.$nextTick()
        const nextButton = wrapper.find('[data-test="next-button"]')
        expect(nextButton.attributes().disabled).toBeUndefined()
      })

      it('emits next when clicked', async () => {
        wrapper.setProps({ hasNext: true })
        await wrapper.vm.$nextTick()
        wrapper.find('[data-test="next-button"]').trigger('click')
        await wrapper.vm.$nextTick()
        expect(wrapper.emitted().next).toHaveLength(1)
      })
    })

    describe('previous button', () => {
      it('is disabled by default', () => {
        const previousButton = wrapper.find('[data-test="previous-button"]')
        expect(previousButton.attributes().disabled).toEqual('disabled')
      })

      it('is enabled if hasPrevious is true', async () => {
        wrapper.setProps({ hasPrevious: true })
        await wrapper.vm.$nextTick()
        const previousButton = wrapper.find('[data-test="previous-button"]')
        expect(previousButton.attributes().disabled).toBeUndefined()
      })

      it('emits back when clicked', async () => {
        wrapper.setProps({ hasPrevious: true })
        await wrapper.vm.$nextTick()
        wrapper.find('[data-test="previous-button"]').trigger('click')
        await wrapper.vm.$nextTick()
        expect(wrapper.emitted().back).toHaveLength(1)
      })
    })

    describe('page counter', () => {
      it('displays the page counter when showPageCount is true', () => {
        const paginationPageCount = wrapper.find('[data-test="pagination-pageCount"]')
        expect(paginationPageCount.text().replace(/\s+/g, ' ')).toEqual('2 / 3')
      })

      it('does not display the page counter when showPageCount is false', async () => {
        wrapper.setProps({ showPageCounter: false })
        await wrapper.vm.$nextTick()
        const paginationPageCount = wrapper.find('[data-test="pagination-pageCount"]')
        expect(paginationPageCount.exists()).toEqual(false)
      })
    })
  })
})
