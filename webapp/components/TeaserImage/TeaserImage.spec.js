import { mount } from '@vue/test-utils'
import TeaserImage from './TeaserImage.vue'

const localVue = global.localVue

describe('TeaserImage.vue', () => {
  let wrapper
  let mocks

  beforeEach(() => {
    mocks = {
      $toast: {
        error: jest.fn(),
      },
      $t: jest.fn(string => string),
    }
  })
  describe('mount', () => {
    const Wrapper = () => {
      return mount(TeaserImage, { mocks, localVue })
    }
    beforeEach(() => {
      wrapper = Wrapper()
    })

    describe('handles errors', () => {
      beforeEach(() => jest.useFakeTimers())
      const message = 'File upload failed'
      const fileError = { status: 'error' }

      it('shows an error toaster when verror is called', () => {
        wrapper.vm.onDropzoneError(fileError, message)
        expect(mocks.$toast.error).toHaveBeenCalledWith(fileError.status, message)
      })
    })
  })
})
