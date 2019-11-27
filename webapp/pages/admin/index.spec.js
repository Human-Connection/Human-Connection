import { mount } from '@vue/test-utils'
import AdminIndexPage from './index.vue'

import VueApollo from 'vue-apollo'

const localVue = global.localVue

localVue.use(VueApollo)

describe('admin/index.vue', () => {
  let Wrapper
  let store
  let mocks

  beforeEach(() => {
    mocks = {
      $t: jest.fn(),
    }
  })

  describe('mount', () => {
    Wrapper = () => {
      return mount(AdminIndexPage, {
        store,
        mocks,
        localVue,
      })
    }

    describe('in loading state', () => {
      beforeEach(() => {
        mocks = { ...mocks, $apolloData: { loading: true } }
      })

      it.skip('shows a loading spinner', () => {
        // I don't know how to mock the data that gets passed to
        // ApolloQuery component
        // What I found:
        // https://github.com/Akryum/vue-apollo/issues/656
        // https://github.com/Akryum/vue-apollo/issues/609
        Wrapper()
        const calls = mocks.$t.mock.calls
        const expected = [['site.error-occurred']]
        expect(calls).toEqual(expected)
      })
    })

    describe('in error state', () => {
      it.todo('displays an error message')
    })
  })
})
