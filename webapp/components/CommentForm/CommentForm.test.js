import { config, mount, createLocalVue } from '@vue/test-utils'
import CommentForm from './index.vue'
import Vue from 'vue'
import Styleguide from '@human-connection/styleguide'

const localVue = createLocalVue()

localVue.use(Styleguide)

config.stubs['no-ssr'] = '<span><slot /></span>'

describe('CommentForm.vue', () => {
  let mocks
  let wrapper
  let form
  let propsData
  let cancelBtn
  let spy

  beforeEach(() => {
    mocks = {
      $t: jest.fn(),
      $apollo: {
        mutate: jest
          .fn()
          .mockResolvedValueOnce({ data: { CreateComment: { contentExcerpt: 'this is a comment' } } })
          .mockRejectedValue({ message: 'Ouch!' })
        },
      $toast: {
        error: jest.fn(),
        success: jest.fn()
      }
    },
    propsData = {
      post: { id: 1  }
    }
  })

  describe('mount', () => {
    const Wrapper = () => {
      return mount(CommentForm, { mocks, localVue, propsData })
    }

    beforeEach(() => {
      wrapper = Wrapper()
      spy = jest.spyOn(wrapper.vm, 'clear')
    })

    it('calls the apollo mutation when form is submitted', () => {
      wrapper.vm.updateEditorContent('this is a comment')
      form = wrapper.find('form')
      form.trigger('submit')
      expect(mocks.$apollo.mutate).toHaveBeenCalledTimes(1)
    })

    it("calls clear method when the cancel button is clicked", () => {
      wrapper.vm.updateEditorContent('ok')
      cancelBtn = wrapper.find('.cancelBtn')
      cancelBtn.trigger('click')
      expect(spy).toHaveBeenCalledTimes(1)
    })

    describe('mutation resolves', () => {
      beforeEach(async () => {
        wrapper.vm.updateEditorContent('this is a comment')
        form = wrapper.find('form')
        form.trigger('submit')
      })
      
      it('shows a success toaster', async () => {
        await mocks.$apollo.mutate
        expect(mocks.$toast.success).toHaveBeenCalledTimes(1)
      })

      it('clears the editor', () => {
        expect(spy).toHaveBeenCalledTimes(1)
      })

      it('emits a method call with the returned comment', () => {
        expect(wrapper.emitted().addComment[0]).toEqual([{ contentExcerpt: 'this is a comment' }])
      })
      
      describe('mutation fails', () => {
        it('shows the error toaster', async () => {
          wrapper.find('form').trigger('submit')
          await mocks.$apollo.mutate
          expect(mocks.$toast.error).toHaveBeenCalledTimes(1)
        })
      })
    })
  })
})