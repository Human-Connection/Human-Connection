import { mount, createLocalVue } from '@vue/test-utils'
import CategoriesSelect from './CategoriesSelect'
import Styleguide from '@human-connection/styleguide'

const localVue = createLocalVue()
localVue.use(Styleguide)

describe('CategoriesSelect.vue', () => {
  let wrapper
  let mocks
  let democracyAndPolitics
  let environmentAndNature
  let consumptionAndSustainablity

  const categories = [
    {
      id: 'cat9',
      name: 'Democracy & Politics',
      icon: 'university',
    },
    {
      id: 'cat4',
      name: 'Environment & Nature',
      icon: 'tree',
    },
    {
      id: 'cat15',
      name: 'Consumption & Sustainability',
      icon: 'shopping-cart',
    },
    {
      name: 'Cooperation & Development',
      icon: 'users',
      id: 'cat8',
    },
  ]
  beforeEach(() => {
    mocks = {
      $t: jest.fn(),
    }
  })

  describe('shallowMount', () => {
    const Wrapper = () => {
      return mount(CategoriesSelect, { mocks, localVue })
    }

    beforeEach(() => {
      wrapper = Wrapper()
    })

    describe('toggleCategory', () => {
      beforeEach(() => {
        wrapper.vm.categories = categories
        democracyAndPolitics = wrapper.findAll('button').at(0)
        democracyAndPolitics.trigger('click')
      })

      it('adds categories to selectedCategoryIds when clicked', () => {
        expect(wrapper.vm.selectedCategoryIds).toEqual([categories[0].id])
      })

      it('emits an updateCategories event when the selectedCategoryIds changes', () => {
        expect(wrapper.emitted().updateCategories[0][0]).toEqual([categories[0].id])
      })

      it('removes categories when clicked a second time', () => {
        democracyAndPolitics.trigger('click')
        expect(wrapper.vm.selectedCategoryIds).toEqual([])
      })

      it('changes the selectedCount when selectedCategoryIds is updated', () => {
        expect(wrapper.vm.selectedCount).toEqual(1)
        democracyAndPolitics.trigger('click')
        expect(wrapper.vm.selectedCount).toEqual(0)
      })

      it('sets a category to active when it has been selected', () => {
        expect(wrapper.vm.isActive(categories[0].id)).toEqual(true)
      })

      describe('maximum', () => {
        beforeEach(() => {
          environmentAndNature = wrapper.findAll('button').at(1)
          consumptionAndSustainablity = wrapper.findAll('button').at(2)
          environmentAndNature.trigger('click')
          consumptionAndSustainablity.trigger('click')
        })

        it('allows three categories to be selected', () => {
          expect(wrapper.vm.selectedCategoryIds).toEqual([
            categories[0].id,
            categories[1].id,
            categories[2].id,
          ])
        })

        it('sets reachedMaximum to true after three', () => {
          expect(wrapper.vm.reachedMaximum).toEqual(true)
        })

        it('sets other categories to disabled after three', () => {
          expect(wrapper.vm.isDisabled(categories[3].id)).toEqual(true)
        })
      })
    })
  })
})
