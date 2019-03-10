import { shallowMount, mount, createLocalVue } from '@vue/test-utils'
import DisableModal from './DisableModal.vue'
import Vue from 'vue'
import Styleguide from '@human-connection/styleguide'

const localVue = createLocalVue()

localVue.use(Styleguide)

describe('DisableModal.vue', () => {
  let store
  let mocks
  let propsData
  let wrapper

  beforeEach(() => {
    propsData = {}
    mocks = {
      $filters: {
        truncate: a => a
      },
      $toast: {
        success: () => {},
        error: () => {}
      },
      $t: jest.fn(),
      $apollo: {
        mutate: jest.fn().mockResolvedValue()
      }
    }
  })

  describe('shallowMount', () => {
    const Wrapper = () => {
      return shallowMount(DisableModal, { propsData, mocks, localVue })
    }

    describe('given a user', () => {
      beforeEach(() => {
        propsData = {
          resource: {
            type: 'user',
            name: 'Bob Ross'
          }
        }
      })

      it('mentions user name', () => {
        Wrapper()
        const calls = mocks.$t.mock.calls
        const expected = [['disable.user.message', { name: 'Bob Ross' }]]
        expect(calls).toEqual(expect.arrayContaining(expected))
      })
    })

    describe('given a contribution', () => {
      beforeEach(() => {
        propsData = {
          resource: {
            type: 'contribution',
            name: 'This is some post content.'
          }
        }
      })

      it('mentions contribution title', () => {
        Wrapper()
        const calls = mocks.$t.mock.calls
        const expected = [
          [
            'disable.contribution.message',
            { name: 'This is some post content.' }
          ]
        ]
        expect(calls).toEqual(expect.arrayContaining(expected))
      })
    })
  })

  describe('mount', () => {
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
