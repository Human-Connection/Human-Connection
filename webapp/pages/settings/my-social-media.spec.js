import { mount, createLocalVue } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import MySocialMedia from './my-social-media.vue'
import Vuex from 'vuex'
import Styleguide from '@human-connection/styleguide'
import Filters from '~/plugins/vue-filters'

const localVue = createLocalVue()

localVue.use(Vuex)
localVue.use(Styleguide)
localVue.use(Filters)

describe('my-social-media.vue', () => {
  let wrapper
  let mocks
  let getters
  const socialMediaUrl = 'https://freeradical.zone/@mattwr18'
  const newSocialMediaUrl = 'https://twitter.com/mattwr18'
  const faviconUrl = 'https://freeradical.zone/favicon.ico'

  beforeEach(() => {
    mocks = {
      $t: jest.fn(),
      $apollo: {
        mutate: jest.fn(),
      },
      $toast: {
        error: jest.fn(),
        success: jest.fn(),
      },
    }
    getters = {
      'auth/user': () => {
        return {}
      },
    }
  })

  describe('mount', () => {
    let form, input, submitButton
    const Wrapper = () => {
      const store = new Vuex.Store({
        getters,
      })
      return mount(MySocialMedia, { store, mocks, localVue })
    }

    describe('adding social media link', () => {
      beforeEach(() => {
        wrapper = Wrapper()
        form = wrapper.find('form')
        input = wrapper.find('input#addSocialMedia')
        submitButton = wrapper.find('button')
      })

      it('requires the link to be a valid url', () => {
        input.setValue('some value')
        form.trigger('submit')

        expect(mocks.$apollo.mutate).not.toHaveBeenCalled()
      })

      it('displays an error message when not saved successfully', async () => {
        mocks.$apollo.mutate.mockRejectedValue({ message: 'Ouch!' })
        input.setValue(newSocialMediaUrl)
        form.trigger('submit')

        await flushPromises()

        expect(mocks.$toast.error).toHaveBeenCalledTimes(1)
      })

      describe('success', () => {
        beforeEach(() => {
          mocks.$apollo.mutate.mockResolvedValue({
            data: { CreateSocialMeda: { id: 's2', url: newSocialMediaUrl } },
          })
          input.setValue(newSocialMediaUrl)
          form.trigger('submit')
        })

        it('sends the new url to the backend', () => {
          const expected = expect.objectContaining({
            variables: { url: newSocialMediaUrl },
          })

          expect(mocks.$apollo.mutate).toHaveBeenCalledTimes(1)
          expect(mocks.$apollo.mutate).toHaveBeenCalledWith(expected)
        })

        it('displays a success message', async () => {
          await flushPromises()

          expect(mocks.$toast.success).toHaveBeenCalledTimes(1)
        })

        it('clears the form', async () => {
          await flushPromises()

          expect(input.value).toBe(undefined)
          expect(submitButton.vm.$attrs.disabled).toBe(true)
        })
      })
    })

    describe('given existing social media links', () => {
      beforeEach(() => {
        getters = {
          'auth/user': () => ({
            socialMedia: [{ id: 's1', url: socialMediaUrl }],
          }),
        }

        wrapper = Wrapper()
        form = wrapper.find('form')
      })

      it('displays the links', () => {
        expect(wrapper.find(`img[src="${faviconUrl}"]`).exists()).toBe(true)
        expect(wrapper.find(`a[href="${socialMediaUrl}"]`).exists()).toBe(true)
        expect(wrapper.find('a[name="edit"]').exists()).toBe(true)
        expect(wrapper.find('a[name="delete"]').exists()).toBe(true)
      })

      it('does not accept a duplicate url', () => {
        input = wrapper.find('input#addSocialMedia')

        input.setValue(socialMediaUrl)
        form.trigger('submit')

        expect(mocks.$apollo.mutate).not.toHaveBeenCalled()
      })

      describe('editing social media link', () => {
        beforeEach(() => {
          const editButton = wrapper.find('a[name="edit"]')
          editButton.trigger('click')
          input = wrapper.find('input#editSocialMedia')
        })

        it('disables adding new links while editing', () => {
          const addInput = wrapper.find('input#addSocialMedia')

          expect(addInput.exists()).toBe(false)
        })

        it('sends the new url to the backend', () => {
          const expected = expect.objectContaining({
            variables: { id: 's1', url: newSocialMediaUrl },
          })
          input.setValue(newSocialMediaUrl)
          form.trigger('submit')

          expect(mocks.$apollo.mutate).toHaveBeenCalledTimes(1)
          expect(mocks.$apollo.mutate).toHaveBeenCalledWith(expected)
        })

        it('allows the user to cancel editing', () => {
          const cancelButton = wrapper.find('button#cancel')
          cancelButton.trigger('click')

          expect(wrapper.find('input#editSocialMedia').exists()).toBe(false)
        })
      })

      describe('deleting social media link', () => {
        beforeEach(() => {
          const deleteButton = wrapper.find('a[name="delete"]')
          deleteButton.trigger('click')
        })

        it('sends the link id to the backend', () => {
          const expected = expect.objectContaining({
            variables: { id: 's1' },
          })

          expect(mocks.$apollo.mutate).toHaveBeenCalledTimes(1)
          expect(mocks.$apollo.mutate).toHaveBeenCalledWith(expected)
        })

        it('displays a success message', async () => {
          await flushPromises()

          expect(mocks.$toast.success).toHaveBeenCalledTimes(1)
        })
      })
    })
  })
})
