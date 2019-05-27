import { mount, createLocalVue } from '@vue/test-utils'
import SearchInput from './SearchInput.vue'
import Vuex from 'vuex'
import Styleguide from '@human-connection/styleguide'
const localVue = createLocalVue()

localVue.use(Vuex)
localVue.use(Styleguide)
localVue.filter('truncate', () => 'truncated string')
localVue.filter('dateTime', () => Date.now)

describe('SearchInput.vue', () => {
  let mocks
  let propsData

  beforeEach(() => {
    propsData = {}
  })

  describe('mount', () => {
    const Wrapper = () => {
      mocks = {
        $t: () => {},
      }
      return mount(SearchInput, { mocks, localVue, propsData })
    }

    it('renders', () => {
      expect(Wrapper().is('div')).toBe(true)
    })

    it('has id "nav-search"', () => {
      expect(Wrapper().contains('#nav-search')).toBe(true)
    })

    it('defaults to an empty value', () => {
      expect(Wrapper().vm.value).toBe('')
    })

    it('defaults to id "nav-search"', () => {
      expect(Wrapper().vm.id).toBe('nav-search')
    })

    it('default to a 300 millisecond delay from the time the user stops typing to when the search starts', () => {
      expect(Wrapper().vm.delay).toEqual(300)
    })

    it('defaults to an empty array as results', () => {
      expect(Wrapper().vm.results).toEqual([])
    })

    it('defaults to pending false, as in the search is not pending', () => {
      expect(Wrapper().vm.pending).toBe(false)
    })

    it('accepts values as a string', () => {
      propsData = { value: 'abc' }
      const wrapper = Wrapper()
      expect(wrapper.vm.value).toEqual('abc')
    })

    describe('testing custom functions', () => {
      let select
      let wrapper

      beforeEach(() => {
        wrapper = Wrapper()
        select = wrapper.find('.ds-select')
        select.trigger('focus')
        select.element.value = 'abcd'
      })

      it('opens the select dropdown when focused on', () => {
        expect(wrapper.vm.isOpen).toBe(true)
      })

      it('opens the select dropdown and blurs after focused on', () => {
        select.trigger('blur')
        expect(wrapper.vm.isOpen).toBe(false)
      })

      it('is clearable', () => {
        select.trigger('input')
        select.trigger('keyup.esc')
        expect(wrapper.emitted().clear.length).toBe(1)
      })

      it('changes the unprocessedSearchInput as the value changes', () => {
        select.trigger('input')
        expect(wrapper.vm.unprocessedSearchInput).toBe('abcd')
      })

      it('searches for the term when enter is pressed', async () => {
        select.trigger('input')
        select.trigger('keyup.enter')
        await expect(wrapper.emitted().search[0]).toEqual(['abcd'])
      })

      it('calls onDelete when the delete key is pressed', () => {
        const spy = jest.spyOn(wrapper.vm, 'onDelete')
        select.trigger('input')
        select.trigger('keyup.delete')
        expect(spy).toHaveBeenCalledTimes(1)
      })

      it('calls query when a user starts a search by pressing enter', () => {
        const spy = jest.spyOn(wrapper.vm, 'query')
        select.trigger('input')
        select.trigger('keyup.enter')
        expect(spy).toHaveBeenCalledWith('abcd')
      })

      it('calls onSelect when a user selects an item in the search dropdown menu', async () => {
        // searched for term in the browser, copied the results from Vuex in Vue dev tools
        propsData = {
          results: [
            {
              __typename: 'Post',
              author: {
                __typename: 'User',
                id: 'u5',
                name: 'Trick',
                slug: 'trick',
              },
              commentsCount: 0,
              createdAt: '2019-03-13T11:00:20.835Z',
              id: 'p10',
              label: 'Eos aut illo omnis quis eaque et iure aut.',
              shoutedCount: 0,
              slug: 'eos-aut-illo-omnis-quis-eaque-et-iure-aut',
              value: 'Eos aut illo omnis quis eaque et iure aut.',
            },
          ],
        }
        wrapper = Wrapper()
        select.trigger('input')
        const results = wrapper.find('.ds-select-option')
        results.trigger('click')
        await expect(wrapper.emitted().select[0]).toEqual(propsData.results)
      })
    })
  })
})
