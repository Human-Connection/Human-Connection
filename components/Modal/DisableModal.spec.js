import { mount, createLocalVue } from '@vue/test-utils'
import DisableModal from './DisableModal.vue'
import Vue from 'vue'
import Styleguide from '@human-connection/styleguide'

const localVue = createLocalVue()

localVue.use(Styleguide)

describe('DisableModal.vue', () => {
  let Wrapper
  let store
  let mocks
  let propsData

  beforeEach(() => {
    propsData = {}
    mocks = {
      $t: () => {},
      $apollo: {
        mutate: jest.fn().mockResolvedValue(null)
      }
    }
  })

  describe('mount', () => {
    let wrapper
    const Wrapper = () => {
      return mount(DisableModal, { propsData, mocks, localVue })
    }

    describe('given id and opened', () => {
      beforeEach(() => {
        propsData = {
          isOpen: true,
          id: 4711
        }
      })

      describe('click cancel button', () => {
        beforeEach(async () => {
          wrapper = Wrapper()
          await wrapper.find('button.cancel').trigger('click')
        })

        it('emits close', () => {
          expect(wrapper.emitted().close).toBeTruthy()
        })

        it('does not call mutation', () => {
          expect(mocks.$apollo.mutate).not.toHaveBeenCalled()
        })
      })

      describe('click confirm button', () => {
        beforeEach(async () => {
          wrapper = Wrapper()
          await wrapper.find('button.confirm').trigger('click')
        })

        it('emits close', () => {
          expect(wrapper.emitted().close).toBeTruthy()
        })

        it('calls mutation', () => {
          expect(mocks.$apollo.mutate).toHaveBeenCalled()
        })

        it('passes id to mutation', () => {
          const calls = mocks.$apollo.mutate.mock.calls
          const [[{ variables }]] = calls
          expect(variables).toEqual({ id: 4711 })
        })
      })
    })
  })
})
