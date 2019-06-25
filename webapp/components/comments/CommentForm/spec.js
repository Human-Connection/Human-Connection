import { mount, createLocalVue, createWrapper } from '@vue/test-utils'
import CommentForm from './index.vue'
import Styleguide from '@human-connection/styleguide'
import Vuex from 'vuex'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(Styleguide)

describe('CommentForm.vue', () => {
  let mocks
  let wrapper
  let propsData
  let cancelBtn
  let cancelMethodSpy

  beforeEach(() => {
    mocks = {
      $t: jest.fn(),
      $apollo: {
        mutate: jest
          .fn()
          .mockResolvedValueOnce({
            data: { CreateComment: { contentExcerpt: 'this is a comment' } },
          })
          .mockRejectedValue({ message: 'Ouch!' }),
      },
      $toast: {
        error: jest.fn(),
        success: jest.fn(),
      },
    }
    propsData = {
      post: { id: 1 },
    }
  })

  describe('mount', () => {
    const getters = {
      'editor/placeholder': () => {
        return 'some cool placeholder'
      },
    }
    const store = new Vuex.Store({
      getters,
    })
    const Wrapper = () => {
      return mount(CommentForm, { mocks, localVue, propsData, store })
    }

    beforeEach(() => {
      wrapper = Wrapper()
      cancelMethodSpy = jest.spyOn(wrapper.vm, 'clear')
    })

    it('calls the apollo mutation when form is submitted', async () => {
      wrapper.vm.updateEditorContent('this is a comment')
      await wrapper.find('form').trigger('submit')
      expect(mocks.$apollo.mutate).toHaveBeenCalledTimes(1)
    })

    it('calls clear method when the cancel button is clicked', () => {
      wrapper.vm.updateEditorContent('ok')
      cancelBtn = wrapper.find('.cancelBtn')
      cancelBtn.trigger('click')
      expect(cancelMethodSpy).toHaveBeenCalledTimes(1)
    })

    describe('mutation resolves', () => {
      beforeEach(async () => {
        wrapper.vm.updateEditorContent('this is a comment')
        wrapper.find('form').trigger('submit')
      })

      it('shows a success toaster', async () => {
        await mocks.$apollo.mutate
        expect(mocks.$toast.success).toHaveBeenCalledTimes(1)
      })

      it('clears the editor', () => {
        expect(cancelMethodSpy).toHaveBeenCalledTimes(1)
      })

      it('emits a method call with the returned comment', () => {
        const rootWrapper = createWrapper(wrapper.vm.$root)
        expect(rootWrapper.emitted().refetchPostComments.length).toEqual(1)
      })

      describe('mutation fails', () => {
        it('shows the error toaster', async () => {
          await wrapper.find('form').trigger('submit')
          await mocks.$apollo.mutate
          expect(mocks.$toast.error).toHaveBeenCalledTimes(1)
        })
      })
    })
  })
})
