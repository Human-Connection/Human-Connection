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
  let submitBtn
  let cancelBtn

  beforeEach(() => {
    mocks = {
      $t: jest.fn(),
      $apollo: {
        mutate: jest
          .fn()
          .mockRejectedValue({ message: 'Ouch!' })
          .mockResolvedValueOnce({ data: { CreateComment: { contentExcerpt: 'this is a comment' } } })
      },
      $toast: {
        error: jest.fn(),
        success: jest.fn()
      },
      $root: {
        $emit: jest.fn()
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
    })

    it('calls the apollo mutation when form is submitted', () => {
      wrapper.vm.updateEditorContent('ok')
      form = wrapper.find('form')
      form.trigger('submit')
      expect(mocks.$apollo.mutate).toHaveBeenCalledTimes(1)
    })

    it("calls clear method when the cancel button is clicked", () => {
      const spy = jest.spyOn(wrapper.vm, 'clear')
      wrapper.vm.updateEditorContent('ok')
      cancelBtn = wrapper.find('.cancelBtn')
      cancelBtn.trigger('click')
      expect(spy).toHaveBeenCalledTimes(1)
    })

    it('shows a success toaster if the mutation resolves', () => {
      wrapper.vm.updateEditorContent('ok')
      form = wrapper.find('form')
      form.trigger('submit')
      expect(mocks.$root.$emit).toHaveBeenCalledTimes(1)
      expect(mocks.$toast.success).toHaveBeenCalledTimes(1)
    })
  })
})