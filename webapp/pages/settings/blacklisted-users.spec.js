import { config, mount, createLocalVue } from '@vue/test-utils'
import BlacklistedUsers from './blacklisted-users.vue'
import Styleguide from '@human-connection/styleguide'
import Filters from '~/plugins/vue-filters'
import { whitelistUserContent } from '~/graphql/settings/BlacklistedUsers'

const localVue = createLocalVue()

localVue.use(Styleguide)
localVue.use(Filters)

config.stubs['nuxt-link'] = '<span><slot /></span>'

describe('blacklisted-users.vue', () => {
  let wrapper
  let mocks

  beforeEach(() => {
    mocks = {
      $t: jest.fn(),
      $apollo: {
        mutate: jest.fn(),
        queries: {
          blacklistedUsers: {
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
      return mount(BlacklistedUsers, { mocks, localVue })
    }

    beforeEach(() => {
      wrapper = Wrapper()
    })

    it('renders', () => {
      expect(wrapper.is('div')).toBe(true)
    })

    describe('given a list of blocked users', () => {
      beforeEach(() => {
        const blacklistedUsers = [{ id: 'u1', name: 'John Doe', slug: 'john-doe', avatar: '' }]
        wrapper.setData({ blacklistedUsers })
      })

      describe('click unblock', () => {
        beforeEach(() => {
          wrapper.find('button').trigger('click')
        })

        it('calls unblock mutation with given user', () => {
          expect(mocks.$apollo.mutate).toHaveBeenCalledWith({
            mutation: whitelistUserContent(),
            variables: { id: 'u1' },
          })
        })
      })
    })
  })
})
