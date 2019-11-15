import { config, mount, createLocalVue } from '@vue/test-utils'
import BlockedUsers from './blocked-users.vue'
import Styleguide from '@human-connection/styleguide'
import Filters from '~/plugins/vue-filters'
import { Unblock } from '~/graphql/settings/BlockedUsers'

const localVue = createLocalVue()

localVue.use(Styleguide)
localVue.use(Filters)

config.stubs['nuxt-link'] = '<span><slot /></span>'

describe('blocked-users.vue', () => {
  let wrapper
  let mocks

  beforeEach(() => {
    mocks = {
      $t: jest.fn(),
      $apollo: {
        mutate: jest.fn(),
        queries: {
          blockedUsers: {
            refetch: jest.fn(),
          },
        },
      },
      $toast: {
        error: jest.fn(),
        success: jest.fn(),
      },
    }
  })

  describe('mount', () => {
    const Wrapper = () => {
      return mount(BlockedUsers, { mocks, localVue })
    }

    beforeEach(() => {
      wrapper = Wrapper()
    })

    it('renders', () => {
      expect(wrapper.is('div')).toBe(true)
    })

    describe('given a list of blocked users', () => {
      beforeEach(() => {
        const blockedUsers = [{ id: 'u1', name: 'John Doe', slug: 'john-doe', avatar: '' }]
        wrapper.setData({ blockedUsers })
      })

      describe('click unblock', () => {
        beforeEach(() => {
          wrapper.find('button').trigger('click')
        })

        it('calls unblock mutation with given user', () => {
          expect(mocks.$apollo.mutate).toHaveBeenCalledWith({
            mutation: Unblock(),
            variables: { id: 'u1' },
          })
        })
      })
    })
  })
})
