import { mount } from '@vue/test-utils'

import Paginate from './Paginate'

const localVue = global.localVue

describe('Paginate.vue', () => {
  let propsData, wrapper, nextButton, backButton

  beforeEach(() => {
    propsData = {}
  })

  const Wrapper = () => {
    return mount(Paginate, { propsData, localVue })
  }
  describe('mount', () => {
    beforeEach(() => {
      wrapper = Wrapper()
    })

    describe('next button', () => {
      beforeEach(() => {
        propsData.hasNext = true
        wrapper = Wrapper()
        nextButton = wrapper.findAll('.base-button').at(0)
      })

      it('is disabled by default', () => {
        propsData = {}
        wrapper = Wrapper()
        nextButton = wrapper.findAll('.base-button').at(0)
        expect(nextButton.attributes().disabled).toEqual('disabled')
      })

      it('is not disabled if hasNext is true', () => {
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
        backButton = wrapper.findAll('.base-button').at(1)
      })

      it('is disabled by default', () => {
        propsData = {}
        wrapper = Wrapper()
        backButton = wrapper.findAll('.base-button').at(1)
        expect(backButton.attributes().disabled).toEqual('disabled')
      })

      it('is not disabled if hasPrevious is true', () => {
        expect(backButton.attributes().disabled).toBeUndefined()
      })

      it('emits back when clicked', async () => {
        await backButton.trigger('click')
        expect(wrapper.emitted().back).toHaveLength(1)
      })
    })
  })
})
