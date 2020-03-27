import { mount } from '@vue/test-utils'
import Vuex from 'vuex'
import FollowingFilter from './FollowingFilter'

const localVue = global.localVue

let wrapper

describe('FollowingFilter', () => {
  const mutations = {
    'posts/TOGGLE_FILTER_BY_FOLLOWED': jest.fn(),
  }
  const getters = {
    'auth/user': () => {
      return { id: 'u34' }
    },
    'posts/filteredByUsersFollowed': jest.fn(),
  }

  const mocks = {
    $t: jest.fn((string) => string),
  }

  const Wrapper = () => {
    const store = new Vuex.Store({ mutations, getters })
    const wrapper = mount(FollowingFilter, { mocks, localVue, store })
    return wrapper
  }

  beforeEach(() => {
    wrapper = Wrapper()
  })

  describe('mount', () => {
    it('sets "filter-by-followed" button attribute `filled`', () => {
      getters['posts/filteredByUsersFollowed'] = jest.fn(() => true)
      const wrapper = Wrapper()
      expect(wrapper.find('.following-filter .sidebar .base-button').classes('--filled')).toBe(true)
    })

    describe('click "filter-by-followed" button', () => {
      it('calls TOGGLE_FILTER_BY_FOLLOWED', () => {
        wrapper.find('.following-filter .sidebar .base-button').trigger('click')
        expect(mutations['posts/TOGGLE_FILTER_BY_FOLLOWED']).toHaveBeenCalledWith({}, 'u34')
      })
    })
  })
})
