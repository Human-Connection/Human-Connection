import { mount, createLocalVue } from '@vue/test-utils'
import Users from './users.vue'
import Styleguide from '@human-connection/styleguide'

const localVue = createLocalVue()

localVue.use(Styleguide)

describe('Users', () => {
  let wrapper
  let Wrapper
  let mocks

  beforeEach(() => {
    mocks = {
      $t: jest.fn(),
      $apollo: {
        loading: false,
      },
    }
  })

  describe('mount', () => {
    Wrapper = () => {
      return mount(Users, {
        mocks,
        localVue,
      })
    }

    it('renders', () => {
      wrapper = Wrapper()
      expect(wrapper.is('div')).toBe(true)
    })

    describe('search', () => {
      let searchAction
      beforeEach(() => {
        searchAction = (wrapper, { query }) => {
          wrapper.find('input').setValue(query)
          wrapper.find('form').trigger('submit')
          return wrapper
        }
      })

      describe('query looks like an email address', () => {
        it('searches users for exact email address', async () => {
          const wrapper = await searchAction(Wrapper(), { query: 'email@example.org' })
          expect(wrapper.vm.email).toEqual('email@example.org')
          expect(wrapper.vm.filter).toBe(null)
        })
      })

      describe('query is just text', () => {
        it('tries to find matching users by `name`, `slug` or `about`', async () => {
          const wrapper = await searchAction(await Wrapper(), { query: 'Find me' })
          const expected = {
            OR: [
              { name_contains: 'Find me' },
              { slug_contains: 'Find me' },
              { about_contains: 'Find me' },
            ],
          }
          expect(wrapper.vm.email).toBe(null)
          expect(wrapper.vm.filter).toEqual(expected)
        })
      })
    })
  })
})
