import { config, mount, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'
import DeleteUserModal from './DeleteUserModal.vue'
const localVue = global.localVue
config.stubs['sweetalert-icon'] = '<span><slot /></span>'
config.stubs['nuxt-link'] = '<span><slot /></span>'

localVue.use(DeleteUserModal)

const getters = {
  'auth/isAdmin': () => true,
  'auth/isModerator': () => false,
}

describe('DeleteUserModal.vue', () => {
  const store = new Vuex.Store({ getters })
  let wrapper
  let propsData = {
    userdata: {
      name: 'another-user',
      slug: 'another-user',
      createdAt: '2020-08-12T08:34:05.803Z',
      contributionsCount: '4',
      commentedCount: '2',
    },
  }
  const mocks = {
    $t: jest.fn(),
    $filters: {
      truncate: (a) => a,
    },
    $toast: {
      success: jest.fn(),
      error: jest.fn(),
    },
    $i18n: {
      locale: () => 'en',
    },
  }

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('shallowMount', () => {
    const Wrapper = () => {
      return shallowMount(DeleteUserModal, {
        propsData,
        mocks,
        store,
        localVue,
      })
    }

    describe('defaults', () => {
      beforeEach(() => {
        wrapper = Wrapper()
      })

      it('success false', () => {
        expect(wrapper.vm.success).toBe(false)
      })

      it('loading false', () => {
        expect(wrapper.vm.loading).toBe(false)
      })
    })
  })

  describe('mount', () => {
    const Wrapper = () => {
      return mount(DeleteUserModal, {
        propsData,
        mocks,
        store,
        localVue,
      })
    }
    beforeEach(jest.useFakeTimers)

    describe('given another user', () => {
      beforeEach(() => {
        propsData = {
          ...propsData,
          type: 'user',
          id: 'u4711',
        }
        wrapper = Wrapper()
      })

      describe('click cancel button', () => {
        beforeEach(() => {
          wrapper = Wrapper()
          wrapper.find('button.cancel').trigger('click')
        })

        it('does not emit "close" yet', () => {
          expect(wrapper.emitted().close).toBeFalsy()
        })

        it('fades away', () => {
          expect(wrapper.vm.isOpen).toBe(false)
        })

        describe('after timeout', () => {
          beforeEach(jest.runAllTimers)

          it('emits "close"', () => {
            expect(wrapper.emitted().close).toBeTruthy()
          })
        })
      })
    })
  })
})
