import { mount, createLocalVue } from '@vue/test-utils'
import TeaserImage from './TeaserImage.vue'
import Styleguide from '@human-connection/styleguide'

const localVue = createLocalVue()

localVue.use(Styleguide)

describe('TeaserImage.vue', () => {
  let wrapper
  let mocks

  beforeEach(() => {
    mocks = {
      $toast: {
        error: jest.fn(),
      },
    }
  })
  describe('mount', () => {
    const Wrapper = () => {
      return mount(TeaserImage, { mocks, localVue })
    }
    beforeEach(() => {
      wrapper = Wrapper()
    })

    describe('File upload', () => {
      const imageUpload = [
        { file: { filename: 'avataar.svg', previewElement: '' }, url: 'someUrlToImage' },
      ]

      it('supports adding a teaser image', () => {
        wrapper.vm.addTeaserImage(imageUpload)
        expect(wrapper.emitted().addTeaserImage[0]).toEqual(imageUpload)
      })
    })

    describe('handles errors', () => {
      beforeEach(() => jest.useFakeTimers())
      const message = 'File upload failed'
      const fileError = { status: 'error' }

      it('defaults to error false', () => {
        expect(wrapper.vm.error).toEqual(false)
      })

      it('shows an error toaster when verror is called', () => {
        wrapper.vm.verror(fileError, message)
        expect(mocks.$toast.error).toHaveBeenCalledWith(fileError.status, message)
      })

      it('changes error status from false to true to false', () => {
        wrapper.vm.verror(fileError, message)
        expect(wrapper.vm.error).toEqual(true)
        jest.runAllTimers()
        expect(wrapper.vm.error).toEqual(false)
      })
    })
  })
})
