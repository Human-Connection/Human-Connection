import { mount, createLocalVue } from '@vue/test-utils'
import PasswordResetPage from './password-reset.vue'
import Styleguide from '@human-connection/styleguide'

const localVue = createLocalVue()

localVue.use(Styleguide)

describe('ProfileSlug', () => {
  let wrapper
  let Wrapper
  let mocks

  beforeEach(() => {
    mocks = {
      $toast: {
        success: jest.fn(),
        error: jest.fn(),
      },
      $t: jest.fn(),
      $apollo: {
        loading: false,
        mutate: jest.fn().mockResolvedValue(),
      },
    }
  })

  describe('mount', () => {
    Wrapper = () => {
      return mount(PasswordResetPage, {
        mocks,
        localVue,
      })
    }

    it('renders a password reset form', () => {
      wrapper = Wrapper()
      expect(wrapper.find('.password-reset-card').exists()).toBe(true)
    })

    describe('submit', () => {
      beforeEach(async () => {
        wrapper = Wrapper()
        wrapper.find('input#email').setValue('mail@example.org')
        await wrapper.find('form').trigger('submit')
      })

      it('calls requestPasswordReset graphql mutation', () => {
        expect(mocks.$apollo.mutate).toHaveBeenCalled()
      })

      it.todo('delivers email to backend')
      it.todo('disables form to avoid re-submission')
      it.todo('displays a message that a password email was requested')
    })

    describe('given password reset token as URL param', () => {
      it.todo('displays a form to update your password')
      describe('submitting new password', () => {
        it.todo('calls resetPassword graphql mutation')
        it.todo('delivers new password to backend')
        it.todo('displays success message')
      })
    })
  })
})
