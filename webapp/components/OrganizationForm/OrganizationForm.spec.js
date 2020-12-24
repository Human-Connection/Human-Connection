import { mount } from '@vue/test-utils'
import OrganizationForm from './OrganizationForm.vue'

import Vue from 'vue'
import Vuex from 'vuex'
import OrganizationMutations from '~/graphql/OrganizationMutations.js'
import CategoriesSelect from '~/components/CategoriesSelect/CategoriesSelect'

import ImageUploader from '~/components/ImageUploader/ImageUploader'
import MutationObserver from 'mutation-observer'

global.MutationObserver = MutationObserver

const localVue = global.localVue

const categories = [
  {
    id: 'cat3',
    slug: 'health-wellbeing',
    icon: 'medkit',
  },
  {
    id: 'cat12',
    slug: 'it-internet-data-privacy',
    icon: 'mouse-pointer',
  },
  {
    id: 'cat9',
    slug: 'democracy-politics',
    icon: 'university',
  },
  {
    id: 'cat15',
    slug: 'consumption-sustainability',
    icon: 'shopping-cart',
  },
  {
    id: 'cat4',
    slug: 'environment-nature',
    icon: 'tree',
  },
]

describe('OrganizationForm.vue', () => {
  let wrapper,
    organizationNameInput,
    emailInput,
    expectedParams,
    cancelBtn,
    mocks,
    propsData,
    categoryIds,
    dataPrivacyButton
  const organizationName = 'this is the name of an organization'
  const organizationEmail = 'contact@example.org'
  const organizationNameTooShort = 'xx'
  let organizationNameTooLong = ''
  for (let i = 0; i < 101; i++) {
    organizationNameTooLong += 'x'
  }
  const organizationDescription = 'this is a description of an organization'
  const imageUpload = {
    file: {
      filename: 'avataar.svg',
      previewElement: '',
    },
    url: 'someUrlToImage',
  }
  const image = { sensitive: false, url: '/uploads/1562010976466-avataaars', aspectRatio: 1 }
  beforeEach(() => {
    mocks = {
      $t: jest.fn(),
      $apollo: {
        mutate: jest.fn().mockResolvedValueOnce({
          data: {
            CreateOrganization: {
              name: organizationName,
              slug: 'this-is-the-name-of-an-organization',
              description: organizationDescription,
              categoryIds,
            },
          },
        }),
      },
      $toast: {
        error: jest.fn(),
        success: jest.fn(),
      },
      $i18n: {
        locale: () => 'en',
      },
      $router: {
        back: jest.fn(),
        push: jest.fn(),
      },
    }
    propsData = {}
  })

  describe('mount', () => {
    const getters = {
      'editor/placeholder': () => {
        return 'some cool placeholder'
      },
      'auth/isModerator': () => false,
      'auth/user': () => {
        return {
          id: '4711',
          name: 'You yourself',
          slug: 'you-yourself',
        }
      },
    }
    const store = new Vuex.Store({
      getters,
    })
    const Wrapper = () => {
      return mount(OrganizationForm, {
        mocks,
        localVue,
        store,
        propsData,
      })
    }

    beforeEach(() => {
      wrapper = Wrapper()
    })

    describe('CreateOrganization', () => {
      describe('invalid form submission', () => {
        beforeEach(async () => {
          wrapper.find(CategoriesSelect).setData({ categories })
          organizationNameInput = wrapper.find('input[name="name"]')
          emailInput = wrapper.find('input[name="email"]')
          organizationNameInput.setValue(organizationName)
          await wrapper.vm.updateEditorContent(organizationDescription)
          dataPrivacyButton = await wrapper
            .find(CategoriesSelect)
            .find('[data-test="category-buttons-cat12"]')
          dataPrivacyButton.trigger('click')
        })

        it('name cannot be empty', async () => {
          organizationNameInput.setValue('')
          wrapper.find('form').trigger('submit')
          expect(mocks.$apollo.mutate).not.toHaveBeenCalled()
        })

        it('name cannot be too long', async () => {
          organizationNameInput.setValue(organizationNameTooLong)
          wrapper.find('form').trigger('submit')
          expect(mocks.$apollo.mutate).not.toHaveBeenCalled()
        })

        it('name cannot be too short', async () => {
          organizationNameInput.setValue(organizationNameTooShort)
          wrapper.find('form').trigger('submit')
          expect(mocks.$apollo.mutate).not.toHaveBeenCalled()
        })

        /*
        it('description cannot be empty', async () => {
          await wrapper.vm.updateEditorContent('')
          await wrapper.find('form').trigger('submit')
          expect(mocks.$apollo.mutate).not.toHaveBeenCalled()
        })
        */

        it('has an email address', async () => {
          emailInput.setValue('')
          wrapper.find('form').trigger('submit')
          expect(mocks.$apollo.mutate).not.toHaveBeenCalled()
        })

        it('has a valid email address', async () => {
          emailInput.setValue('no email')
          wrapper.find('form').trigger('submit')
          expect(mocks.$apollo.mutate).not.toHaveBeenCalled()
        })

        it('has at least one category', async () => {
          dataPrivacyButton = await wrapper
            .find(CategoriesSelect)
            .find('[data-test="category-buttons-cat12"]')
          dataPrivacyButton.trigger('click')
          wrapper.find('form').trigger('submit')
          expect(mocks.$apollo.mutate).not.toHaveBeenCalled()
        })

        it('has no more than three categories', async () => {
          wrapper.vm.formData.categoryIds = ['cat4', 'cat9', 'cat15', 'cat27']
          await Vue.nextTick()
          wrapper.find('form').trigger('submit')
          expect(mocks.$apollo.mutate).not.toHaveBeenCalled()
        })
      })

      describe('valid form submission', () => {
        beforeEach(async () => {
          expectedParams = {
            mutation: OrganizationMutations().CreateOrganization,
            variables: {
              name: organizationName,
              description: organizationDescription,
              id: null,
              categoryIds: ['cat12'],
              image: null,
              locationName: '',
              email: 'contact@example.org',
            },
          }
          organizationNameInput = wrapper.find('input[name="name"]')
          organizationNameInput.setValue(organizationName)
          emailInput = wrapper.find('input[name="email"]')
          emailInput.setValue(organizationEmail)
          await wrapper.vm.updateEditorContent(organizationDescription)
          wrapper.find(CategoriesSelect).setData({ categories })
          await Vue.nextTick()
          dataPrivacyButton = await wrapper
            .find(CategoriesSelect)
            .find('[data-test="category-buttons-cat12"]')
          dataPrivacyButton.trigger('click')
          await Vue.nextTick()
        })

        it('creates an organization with valid name, email, and at least one category', async () => {
          await wrapper.find('form').trigger('submit')
          expect(mocks.$apollo.mutate).toHaveBeenCalledWith(expect.objectContaining(expectedParams))
        })

        it('supports adding a teaser image', async () => {
          expectedParams.variables.image = {
            aspectRatio: null,
            sensitive: null,
            upload: imageUpload,
          }
          const spy = jest
            .spyOn(FileReader.prototype, 'readAsDataURL')
            .mockImplementation(function () {
              this.onload({ target: { result: 'someUrlToImage' } })
            })
          wrapper.find(ImageUploader).vm.$emit('addHeroImage', imageUpload)
          await wrapper.find('form').trigger('submit')
          expect(mocks.$apollo.mutate).toHaveBeenCalledWith(expect.objectContaining(expectedParams))
          expect(spy).toHaveBeenCalledWith(imageUpload)
          spy.mockReset()
        })

        it("pushes the user to the organization's page", async () => {
          wrapper.find('form').trigger('submit')
          await mocks.$apollo.mutate
          expect(mocks.$router.push).toHaveBeenCalledTimes(1)
        })

        it('shows a success toaster', async () => {
          wrapper.find('form').trigger('submit')
          await mocks.$apollo.mutate
          expect(mocks.$toast.success).toHaveBeenCalledTimes(1)
        })
      })

      describe('cancel', () => {
        it('calls $router.back() when cancel button clicked', () => {
          cancelBtn = wrapper.find('[data-test="cancel-button"]')
          cancelBtn.trigger('click')
          expect(mocks.$router.back).toHaveBeenCalledTimes(1)
        })
      })

      describe('handles errors', () => {
        beforeEach(async () => {
          jest.useFakeTimers()
          mocks.$apollo.mutate = jest.fn().mockRejectedValueOnce({
            message: 'Not Authorised!',
          })
          wrapper = Wrapper()
          organizationNameInput = wrapper.find('input[name="name"]')
          organizationNameInput.setValue(organizationName)
          emailInput = wrapper.find('input[name="email"]')
          emailInput.setValue(organizationEmail)
          await wrapper.vm.updateEditorContent(organizationDescription)
          categoryIds = ['cat12']
          wrapper.find(CategoriesSelect).setData({ categories })
          await Vue.nextTick()
          dataPrivacyButton = await wrapper
            .find(CategoriesSelect)
            .find('[data-test="category-buttons-cat12"]')
          dataPrivacyButton.trigger('click')
          await Vue.nextTick()
        })

        it('shows an error toaster when apollo mutation rejects', async () => {
          await wrapper.find('form').trigger('submit')
          await mocks.$apollo.mutate
          await expect(mocks.$toast.error).toHaveBeenCalledWith('Not Authorised!')
        })
      })
    })

    describe('UpdateOrganization', () => {
      beforeEach(() => {
        propsData = {
          organization: {
            id: 'o1456',
            slug: 'dies-ist-eine-organisation',
            name: 'dies ist eine Organisation',
            description: 'auf Deutsch geschrieben',
            image,
            categories: [
              {
                id: 'cat12',
                name: 'Democracy & Politics',
              },
            ],
            locationName: '',
            email: 'contact@example.org',
          },
        }
        wrapper = Wrapper()
      })

      it('sets name equal to organization name', () => {
        expect(wrapper.vm.formData.name).toEqual(propsData.organization.name)
      })

      it('sets description equal to organization description', () => {
        expect(wrapper.vm.formData.description).toEqual(propsData.organization.description)
      })

      describe('valid update', () => {
        beforeEach(() => {
          mocks.$apollo.mutate = jest.fn().mockResolvedValueOnce({
            data: {
              UpdateOrganization: {
                name: organizationName,
                slug: 'this-is-a-name-of-a-organization',
                description: organizationDescription,
                categoryIds,
                locationName: '',
                email: organizationEmail,
              },
            },
          })
          wrapper = Wrapper()
          expectedParams = {
            mutation: OrganizationMutations().UpdateOrganization,
            variables: {
              name: propsData.organization.name,
              description: propsData.organization.description,
              id: propsData.organization.id,
              categoryIds: ['cat12'],
              image: {
                sensitive: null,
              },
              locationName: '',
              email: organizationEmail,
            },
          }
        })

        it('calls the UpdateOrganization apollo mutation', async () => {
          expectedParams.variables.description = organizationDescription
          wrapper.vm.updateEditorContent(organizationDescription)
          await wrapper.find('form').trigger('submit')
          expect(mocks.$apollo.mutate).toHaveBeenCalledWith(expect.objectContaining(expectedParams))
        })

        it('supports updating categories', async () => {
          expectedParams.variables.categoryIds.push('cat3')
          wrapper.find(CategoriesSelect).setData({ categories })
          await Vue.nextTick()
          const healthWellbeingButton = await wrapper
            .find(CategoriesSelect)
            .find('[data-test="category-buttons-cat3"]')
          healthWellbeingButton.trigger('click')
          await wrapper.find('form').trigger('submit')
          expect(mocks.$apollo.mutate).toHaveBeenCalledWith(expect.objectContaining(expectedParams))
        })

        it('supports deleting a teaser image', async () => {
          expectedParams.variables.image = null
          propsData.organization.image = { url: '/uploads/someimage.png' }
          wrapper = Wrapper()
          wrapper.find('[data-test="delete-button"]').trigger('click')
          await wrapper.find('form').trigger('submit')
          expect(mocks.$apollo.mutate).toHaveBeenCalledWith(expect.objectContaining(expectedParams))
        })
      })
    })
  })
})
