import { config, mount, createLocalVue } from '@vue/test-utils'
import MutedUsers from './muted-users.vue'
import Styleguide from '@human-connection/styleguide'
import Filters from '~/plugins/vue-filters'
import { unmuteUser } from '~/graphql/settings/MutedUsers'

const localVue = createLocalVue()

localVue.use(Styleguide)
localVue.use(Filters)

config.stubs['nuxt-link'] = '<span><slot /></span>'

describe('muted-users.vue', () => {
  let wrapper
  let mocks

  beforeEach(() => {
    mocks = {
      $t: jest.fn(),
      $apollo: {
        mutate: jest.fn(),
        queries: {
          mutedUsers: {
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
      return mount(MutedUsers, { mocks, localVue })
    }

    beforeEach(() => {
      wrapper = Wrapper()
    })

    it('renders', () => {
      expect(wrapper.is('div')).toBe(true)
    })

    describe('given a list of muted users', () => {
      beforeEach(() => {
        const mutedUsers = [{ id: 'u1', name: 'John Doe', slug: 'john-doe' }]
        wrapper.setData({ mutedUsers })
      })

      describe('click unmute', () => {
        beforeEach(() => {
          wrapper.find('.base-button').trigger('click')
        })

        it('calls unmute mutation with given user', () => {
          expect(mocks.$apollo.mutate).toHaveBeenCalledWith({
            mutation: unmuteUser(),
            variables: { id: 'u1' },
          })
        })
      })
    })
  })
})
