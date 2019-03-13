import { mount, createLocalVue } from '@vue/test-utils'
import ChangePassword from './ChangePassword.vue'
import Vue from 'vue'
import Styleguide from '@human-connection/styleguide'

const localVue = createLocalVue()

localVue.use(Styleguide)

describe('ChangePassword.vue', () => {
  let store
  let mocks
  let wrapper

  beforeEach(() => {
    mocks = {
      $t: jest.fn(),
      $apollo: {
        mutate: jest.fn().mockResolvedValue()
      }
    }
  })

  describe('mount', () => {
    let wrapper
    const Wrapper = () => {
      return mount(ChangePassword, { mocks, localVue })
    }

    beforeEach(() => {
      wrapper = Wrapper()
    })

    it('renders three input fields', () => {
      expect(wrapper.findAll('input')).toHaveLength(3)
    })

    describe('validations', () => {
      it('invalid', () => {
        expect(wrapper.vm.disabled).toBe(true)
      })

      describe('old password and new password', () => {
        describe('match', () => {
          beforeEach(() => {
            wrapper.find('input#oldPassword').setValue('some secret')
            wrapper.find('input#newPassword').setValue('some secret')
          })

          it('invalid', () => {
            expect(wrapper.vm.disabled).toBe(true)
          })

          it.skip('displays a warning', () => {
            const calls = mocks.$t.mock.calls
            const expected = [
              ['change-password.validations.old-and-new-password-match']
            ]
            expect(calls).toEqual(expect.arrayContaining(expected))
          })
        })
      })

      describe('new password and confirmation', () => {
        describe('mismatch', () => {
          it.todo('invalid')
          it.todo('displays a warning')
        })

        describe('match', () => {
          describe('and old password mismatch', () => {
            it.todo('valid')
          })

          describe('clicked', () => {
            it.todo('sets loading')
          })
        })
      })
    })

    describe('given valid input', () => {
      describe('click on submit button', () => {
        it.todo('calls changePassword mutation')

        describe('mutation resolves', () => {
          it.todo('calls auth/SET_TOKEN with response')
        })

        describe('mutation rejects', () => {
          it.todo('displays error message')
        })
      })
    })
  })
})
