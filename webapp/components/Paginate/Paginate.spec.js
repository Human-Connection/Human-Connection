import { mount, createLocalVue } from '@vue/test-utils'
import Styleguide from '@human-connection/styleguide'
import Paginate from './Paginate'

const localVue = createLocalVue()

localVue.use(Styleguide)

describe('Paginate.vue', () => {
  let propsData, wrapper, Wrapper, nextButton, backButton

  beforeEach(() => {
    propsData = {}
  })

  Wrapper = () => {
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
        nextButton = wrapper.findAll('.ds-button').at(0)
      })

      it('is disabled by default', () => {
        propsData = {}
        wrapper = Wrapper()
        nextButton = wrapper.findAll('.ds-button').at(0)
        expect(nextButton.attributes().disabled).toEqual('disabled')
      })

      it('is not disabled if hasNext is true', () => {
        expect(nextButton.attributes().disabled).toBeUndefined()
      })

      it('emits back when clicked', async () => {
        await nextButton.trigger('click')
        expect(wrapper.emitted().next).toHaveLength(1)
      })
    })

    describe('back button', () => {
      beforeEach(() => {
        propsData.hasPrevious = true
        wrapper = Wrapper()
        backButton = wrapper.findAll('.ds-button').at(1)
      })

      it('is disabled by default', () => {
        propsData = {}
        wrapper = Wrapper()
        backButton = wrapper.findAll('.ds-button').at(1)
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
