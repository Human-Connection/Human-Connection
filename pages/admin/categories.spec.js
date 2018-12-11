import { shallowMount, mount } from '@vue/test-utils'
import Categories from './categories.vue'

const someCategories = [
  {
    id: 'cat1',
    name: 'Just For Fun',
    slug: 'justforfun',
    icon: 'smile',
    postCount: 5
  },
  {
    id: 'cat2',
    name: 'Happyness & Values',
    slug: 'happyness-values',
    icon: 'heart-o',
    postCount: 2
  },
  {
    id: 'cat3',
    name: 'Health & Wellbeing',
    slug: 'health-wellbeing',
    icon: 'medkit',
    postCount: 1
  },
  {
    id: 'cat4',
    name: 'Environment & Nature',
    slug: 'environment-nature',
    icon: 'tree',
    postCount: 1
  },
  {
    id: 'cat5',
    name: 'Animal Protection',
    slug: 'animalprotection',
    icon: 'paw',
    postCount: 1
  }
]

describe('Categories.vue', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(Categories, {})
  })

  it('renders', () => {
    expect(wrapper.is('div')).toBe(true)
  })

  describe('given some categories', () => {
    beforeEach(() => {
      wrapper = mount(Categories, {
        propsData: {
          Categories: someCategories
        }
      })
    })

    it('renders a row for each category', () => {
      console.log(wrapper.html())
      expect(wrapper.findAll('tr')).toHaveLength(5)
    })
  })
})
