import { shallowMount, mount, createLocalVue } from '@vue/test-utils'
import ReleaseModal from './ReleaseModal.vue'
import Styleguide from '@human-connection/styleguide'

const localVue = createLocalVue()

localVue.use(Styleguide)

describe('ReleaseModal.vue', () => {
  let mocks
  let propsData
  let wrapper
  let Wrapper

  beforeEach(() => {
    propsData = {
      type: 'contribution',
      name: 'blah',
      id: 'c42',
    }
    mocks = {
      $filters: {
        truncate: a => a,
      },
      $toast: {
        success: jest.fn(),
        error: jest.fn(),
      },
      $t: jest.fn(),
      $apollo: {
        mutate: jest
          .fn()
          .mockResolvedValueOnce({ enable: 'u4711' })
          .mockRejectedValue({ message: 'Not Authorised!' }),
      },
    }
  })

  describe('shallowMount', () => {
    Wrapper = () => {
      return shallowMount(ReleaseModal, {
        propsData,
        mocks,
        localVue,
      })
    }

    describe('given a user', () => {
      beforeEach(() => {
        propsData = {
          type: 'user',
          id: 'u2',
          name: 'Bob Ross',
        }
      })

      it('mentions user name', () => {
        Wrapper()
        const calls = mocks.$t.mock.calls
        const expected = [
          [
            'release.user.message',
            {
              name: 'Bob Ross',
            },
          ],
        ]
        expect(calls).toEqual(expect.arrayContaining(expected))
      })
    })

    describe('given a contribution', () => {
      beforeEach(() => {
        propsData = {
          type: 'contribution',
          id: 'c3',
          name: 'This is some post title.',
        }
      })

      it('mentions contribution title', () => {
        Wrapper()
        const calls = mocks.$t.mock.calls
        const expected = [
          [
            'release.contribution.message',
            {
              name: 'This is some post title.',
            },
          ],
        ]
        expect(calls).toEqual(expect.arrayContaining(expected))
      })
    })
  })

  describe('mount', () => {
    Wrapper = () => {
      return mount(ReleaseModal, {
        propsData,
        mocks,
        localVue,
      })
    }

    beforeEach(jest.useFakeTimers)

    describe('given id', () => {
      beforeEach(() => {
        propsData = {
          type: 'user',
          id: 'u4711',
        }
      })

      describe('click cancel button', () => {
        beforeEach(() => {
          wrapper = Wrapper()
          wrapper.find('button.cancel').trigger('click')
        })

        it('does not emit "close" yet', () => {
          expect(wrapper.emitted().close).toBeFalsy()
        })

        it('fades away', () => {
          expect(wrapper.vm.isOpen).toBe(false)
        })

        describe('after timeout', () => {
          beforeEach(jest.runAllTimers)

          it('does not call mutation', () => {
            expect(mocks.$apollo.mutate).not.toHaveBeenCalled()
          })

          it('emits close', () => {
            expect(wrapper.emitted().close).toBeTruthy()
          })
        })
      })

      describe('click confirm button', () => {
        beforeEach(() => {
          wrapper = Wrapper()
          wrapper.find('button.confirm').trigger('click')
        })

        afterEach(() => {
          jest.clearAllMocks()
        })

        it('calls mutation', () => {
          expect(mocks.$apollo.mutate).toHaveBeenCalled()
        })

        it('passes id to mutation', () => {
          const calls = mocks.$apollo.mutate.mock.calls
          const [[{ variables }]] = calls
          expect(variables).toEqual({
            id: 'u4711',
          })
        })

        it('fades away', () => {
          expect(wrapper.vm.isOpen).toBe(false)
        })

        describe('after timeout', () => {
          beforeEach(jest.runAllTimers)

          it('emits close', () => {
            expect(wrapper.emitted().close).toBeTruthy()
          })
        })

        describe('handles errors', () => {
          beforeEach(() => {
            wrapper = Wrapper()
            // second submission causes mutation to reject
            wrapper.find('button.confirm').trigger('click')
          })

          it('shows an error toaster when mutation rejects', async () => {
            await expect(mocks.$toast.error).toHaveBeenCalledTimes(1)
          })
        })
      })
    })
  })
})
