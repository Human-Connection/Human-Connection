import { shallowMount, createLocalVue } from '@vue/test-utils'
import Upload from '.'
import Vuex from 'vuex'
import Styleguide from '@human-connection/styleguide'

const localVue = createLocalVue()

localVue.use(Vuex)
localVue.use(Styleguide)

describe('Upload', () => {
  let wrapper

  const mocks = {
    $apollo: {
      mutate: jest
        .fn()
        .mockResolvedValueOnce({
          data: { UpdateUser: { id: 'upload1', avatar: '/upload/avatar.jpg' } },
        })
        .mockRejectedValue({
          message: 'File upload unsuccessful! Whatcha gonna do?',
        }),
    },
    $toast: {
      success: jest.fn(),
      error: jest.fn(),
    },
  }

  const propsData = {
    user: {
      avatar: '/api/generic.jpg',
    },
  }

  const file = {
    filename: 'avatar.jpg',
    previewElement: {
      classList: {
        remove: jest.fn(),
        add: jest.fn(),
      },
      querySelectorAll: jest.fn().mockReturnValue([
        {
          alt: '',
          style: {
            'background-image': '/api/generic.jpg',
          },
        },
      ]),
    },
  }

  const dataUrl = 'avatar.jpg'

  beforeEach(() => {
    jest.useFakeTimers()
    wrapper = shallowMount(Upload, { localVue, propsData, mocks })
  })

  it('sends a the UpdateUser mutation when vddrop is called', () => {
    wrapper.vm.vddrop([{ filename: 'avatar.jpg' }])
    expect(mocks.$apollo.mutate).toHaveBeenCalledTimes(1)
  })

  it('thumbnail', () => {
    wrapper.vm.thumbnail(file, dataUrl)
    expect(file.previewElement.classList.add).toHaveBeenCalledTimes(1)
  })
})
