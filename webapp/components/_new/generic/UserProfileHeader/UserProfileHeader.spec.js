import { mount, shallowMount } from '@vue/test-utils'
import UserProfileHeader from './UserProfileHeader.vue'
import vueDropzone from 'nuxt-dropzone'
import Vue from 'vue'

const localVue = global.localVue

describe('UserProfileHeader.vue', () => {
  let propsData, wrapper, mocks

  beforeEach(() => {
    propsData = {}
    wrapper = Wrapper()
  })

  const Wrapper = () => {
    return mount(UserProfileHeader, { propsData, localVue })
  }

  it('renders no image', () => {
    expect(wrapper.contains('img')).toBe(false)
  })

  it('renders no dropzone', () => {
    expect(wrapper.contains(vueDropzone)).toBe(false)
  })

  describe('given a user', () => {
    describe('with no header image', () => {
      beforeEach(() => {
        propsData = {
          user: {
            name: 'Matt Rider',
          },
        }
        wrapper = Wrapper()
      })

      it('renders no img tag', () => {
        expect(wrapper.contains('img')).toBe(false)
      })
    })

    describe('with a header image', () => {
      beforeEach(() => {
        propsData = {
          user: {
            name: 'Matt Rider',
            profileHeader: {
              url: 'https://source.unsplash.com/640x480',
            },
          },
        }
        wrapper = Wrapper()
      })

      it('renders an image', () => {
        expect(wrapper.contains('img')).toBe(true)
      })
    })

    describe('with a relative header url', () => {
      beforeEach(() => {
        propsData = {
          user: {
            name: 'Not Anonymous',
            profileHeader: {
              url: '/profileHeader.jpg',
            },
          },
        }
        wrapper = Wrapper()
      })

      it('adds a prefix to load the image from the uploads service', () => {
        expect(wrapper.find('img').attributes('src')).toBe('/api/profileHeader.jpg')
      })
    })

    describe('with an absolute header url', () => {
      beforeEach(() => {
        propsData = {
          user: {
            name: 'Not Anonymous',
            profileHeader: {
              url: 'https://s3.amazonaws.com/uifaces/faces/twitter/sawalazar/128.jpg',
            },
          },
        }
        wrapper = Wrapper()
      })

      it('keeps the header URL as is', () => {
        // e.g. our seeds have absolute image URLs
        expect(wrapper.find('img').attributes('src')).toBe(
          'https://s3.amazonaws.com/uifaces/faces/twitter/sawalazar/128.jpg',
        )
      })
    })

    describe('on his own userpage', () => {
      beforeEach(() => {
        propsData = {
          editable: true,
          user: {
            name: 'Not Anonymous',
            profileHeader: {
              url: 'https://s3.amazonaws.com/uifaces/faces/twitter/sawalazar/128.jpg',
            },
          },
        }
        wrapper = Wrapper()
      })

      it('a dropzone is present', () => {
        expect(wrapper.contains(vueDropzone)).toBe(true)
      })

      describe('uploading and image', () => {
        beforeAll(() => {
          propsData = {
            user: {
              profileHeader: { url: '/api/profileHeader.jpg' },
            },
          }
          mocks = {
            $apollo: {
              mutate: jest
                .fn()
                .mockResolvedValueOnce({
                  data: {
                    UpdateUser: {
                      id: 'upload1',
                      profileHeader: { url: '/upload/profileHeader.jpg' },
                    },
                  },
                })
                .mockRejectedValue({
                  message: 'File upload unsuccessful!',
                }),
            },
            $toast: {
              success: jest.fn(),
              error: jest.fn(),
            },
            $t: jest.fn(),
          }
        })

        beforeEach(() => {
          jest.useFakeTimers()
          wrapper = shallowMount(UserProfileHeader, { localVue, propsData, mocks })
        })

        afterEach(() => {
          jest.clearAllMocks()
        })

        it('sends a UpdateUser mutation when vddrop is called', () => {
          wrapper.vm.vddrop([{ filename: 'profileHeader.jpg' }])
          expect(mocks.$apollo.mutate).toHaveBeenCalledTimes(1)
        })

        describe('error handling', () => {
          const message = 'File upload failed'
          const fileError = { status: 'error' }

          it('defaults to error false', () => {
            expect(wrapper.vm.error).toEqual(false)
          })

          it('shows an error toaster when verror is called', () => {
            wrapper.vm.verror(fileError, message)
            expect(mocks.$toast.error).toHaveBeenCalledWith(fileError.status, message)
          })

          it('changes error status from false to true to false', async () => {
            wrapper.vm.verror(fileError, message)
            await Vue.nextTick()
            expect(wrapper.vm.error).toEqual(true)
            jest.runAllTimers()
            expect(wrapper.vm.error).toEqual(false)
          })

          it('shows an error toaster when the apollo mutation rejects', async () => {
            // calls vddrop twice because of how mockResolvedValueOnce works in jest
            // the first time the mock function is called it will resolve, calling it a
            // second time will cause it to fail(with this implementation)
            // https://jestjs.io/docs/en/mock-function-api.html#mockfnmockresolvedvalueoncevalue
            await wrapper.vm.vddrop([{ filename: 'profileHeader.jpg' }])
            await wrapper.vm.vddrop([{ filename: 'profileHeader.jpg' }])
            expect(mocks.$toast.error).toHaveBeenCalledTimes(1)
          })
        })
      })
    })

    describe("on a different user's userpage", () => {
      beforeEach(() => {
        propsData = {
          editable: false,
          user: {
            name: 'Not Anonymous',
            profileHeader: {
              url: 'https://s3.amazonaws.com/uifaces/faces/twitter/sawalazar/128.jpg',
            },
          },
        }
        wrapper = Wrapper()
      })

      it('no dropzone is present', () => {
        expect(wrapper.contains(vueDropzone)).toBe(false)
      })
    })
  })
})
