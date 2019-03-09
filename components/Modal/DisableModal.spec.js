import { shallowMount, createLocalVue } from '@vue/test-utils'
import DisableModal from './DisableModal.vue'
import Vue from 'vue'
import Styleguide from '@human-connection/styleguide'


const localVue = createLocalVue()

localVue.use(Styleguide)

describe('DisableModal.vue', () => {
  let Wrapper
  let store
  let mocks

  beforeEach(() => {
    mocks = {
      $t: () => {},
      $apollo: {
        mutate: jest.fn().mockResolvedValue(null)
      }
    }
  })

  describe('shallowMount', () => {
    let wrapper
    const Wrapper = () => {
      return shallowMount(DisableModal, { mocks, localVue })
    }

    describe('click cancel button', () => {
      beforeEach(async () => {
        wrapper = Wrapper()
        await wrapper.find('button.cancel').trigger('click')
      })

      it('emits close', () => {
        expect(wrapper.emitted().close).toBeTruthy()
      })

      it.todo('does not call mutation')
    })

    describe('click confirm button', () => {
      beforeEach(async () => {
        wrapper = Wrapper()
        await wrapper.find('button.confirm').trigger('click')
      })

      it('emits close', () => {
        expect(wrapper.emitted().close).toBeTruthy()
      })
      it.todo('calls disable mutation')
      it.todo('passes id to mutation')
    })
  })
})
