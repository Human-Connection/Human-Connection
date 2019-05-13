import { config, mount, createLocalVue, createWrapper } from '@vue/test-utils'
import CommentForm from './index.vue'
import Vue from 'vue'
import Styleguide from '@human-connection/styleguide'

const localVue = createLocalVue()

localVue.use(Styleguide)

config.stubs['no-ssr'] = '<span><slot /></span>'

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
            data: {
              CreateComment: { postId: 'p1', content: 'this is a comment' }
            }
          })
          .mockRejectedValue({ message: 'Ouch!' })
      },
      $toast: {
        error: jest.fn(),
        success: jest.fn()
      }
    }
    propsData = {
      post: { id: 'p1' }
    }
  })

  describe('mount', () => {
    const Wrapper = () => {
      return mount(CommentForm, { mocks, localVue, propsData })
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
      beforeEach(() => {
        wrapper.vm.updateEditorContent('this is a comment')
        wrapper.find('form').trigger('submit')
      })

      it('shows a success toaster', async () => {
        expect(mocks.$toast.success).toHaveBeenCalledTimes(1)
      })

      it('clears the editor', () => {
        expect(cancelMethodSpy).toHaveBeenCalledTimes(1)
      })

      it('emits a method call with the returned comment', () => {
        const rootWrapper = createWrapper(wrapper.vm.$root)
        expect(rootWrapper.emitted().refetchPostComments.length).toEqual(1)
      })
    })

    // describe('mutation fails', () => {
    //   it('shows the error toaster', async () => {
    //     wrapper.vm.updateEditorContent('')
    //     await wrapper.find('form').trigger('submit')
    //     // await mocks.$apollo.mutate
    //     expect(mocks.$toast.error).toHaveBeenCalledTimes(1)
    //   })
    // })
  })
})
