import { shallowMount, createLocalVue } from '@vue/test-utils'
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
      $apollo: {
        mutate: jest.fn().mockResolvedValue()
      }
    }
  })

  describe('shallowMount', () => {
    const Wrapper = () => {
      return shallowMount(ChangePassword, { mocks, localVue })
    }

    it.todo('renders')

    describe('validations', () => {
      it.todo('is disabled')

      describe('old password and new password', () => {
        describe('match', () => {
          it.todo('invalid')
          it.todo('displays a warning')
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
