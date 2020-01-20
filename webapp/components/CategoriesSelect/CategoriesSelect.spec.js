import { mount } from '@vue/test-utils'
import CategoriesSelect from './CategoriesSelect'
import Vue from 'vue'

const localVue = global.localVue

describe('CategoriesSelect.vue', () => {
  let wrapper
  let mocks
  let provide
  let democracyAndPolitics
  let environmentAndNature
  let consumptionAndSustainablity

  const propsData = { model: 'categoryIds' }
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
    provide = {
      $parentForm: {
        update: jest.fn(),
      },
    }
    mocks = {
      $t: jest.fn(),
    }
  })

  describe('shallowMount', () => {
    const Wrapper = () => {
      return mount(CategoriesSelect, { propsData, mocks, localVue, provide })
    }

    beforeEach(() => {
      wrapper = Wrapper()
    })

    describe('toggleCategory', () => {
      beforeEach(async () => {
        wrapper.vm.categories = categories
        await Vue.nextTick()
        democracyAndPolitics = wrapper.findAll('button').at(0)
        democracyAndPolitics.trigger('click')
      })

      it('adds categories to selectedCategoryIds when clicked', () => {
        expect(wrapper.vm.selectedCategoryIds).toEqual([categories[0].id])
      })

      it('calls $parent.update with selected category ids', () => {
        expect(provide.$parentForm.update).toHaveBeenCalledWith('categoryIds', ['cat9'])
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
