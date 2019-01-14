import { shallowMount } from '@vue/test-utils'
import Comp from './Select.vue'

describe('Select.vue', () => {
  describe('Events emitting', () => {
    describe('@input', () => {
      test('should be called when the value is changed passing the new value', () => {
        const wrapper = shallowMount(Comp, {
          propsData: {
            value: '3',
            options: ['1', '2', '3']
          }
        })
        wrapper.vm.selectOption(wrapper.vm.options[0])
        expect(wrapper.emitted().input[0]).toEqual(['1'])
      })
      test('should be called when an option is clicked passing the options value', () => {
        const wrapper = shallowMount(Comp, {
          propsData: {
            value: '3',
            options: ['1', '2', '3']
          }
        })
        wrapper.find('.ds-select-option').trigger('click')
        expect(wrapper.emitted().input[0]).toEqual(['1'])
      })
    })
  })

  describe('innerValue', () => {
    test('should contain a single selected value by default', () => {
      const wrapper = shallowMount(Comp, {
        propsData: {
          value: '1',
          options: ['1', '2', '3']
        }
      })
      expect(wrapper.vm.innerValue).toEqual('1')
    })
    test('should contain an array of values when multiple: true', () => {
      const wrapper = shallowMount(Comp, {
        propsData: {
          value: ['1'],
          options: ['1', '2', '3'],
          multiple: true
        }
      })
      expect(wrapper.vm.innerValue).toEqual(['1'])
    })
  })

  describe('options', () => {
    test('should highlight the selected value', () => {
      const wrapper = shallowMount(Comp, {
        propsData: {
          value: '1',
          options: ['1', '2', '3']
        }
      })
      const option = wrapper.find('.ds-select-option')
      expect(option.classes()).toContain('ds-select-option-is-selected')
    })
    test('should highlight all selected values when multiple: true', () => {
      const wrapper = shallowMount(Comp, {
        propsData: {
          value: ['1', '2'],
          options: ['1', '2', '3'],
          multiple: true
        }
      })
      const option = wrapper.findAll('.ds-select-option')
      expect(option.at(0).classes()).toContain('ds-select-option-is-selected')
      expect(option.at(1).classes()).toContain('ds-select-option-is-selected')
    })
  })

  describe('selectOption', () => {
    test('should set innerValue to selected value', () => {
      const wrapper = shallowMount(Comp, {
        propsData: {
          value: '3',
          options: ['1', '2', '3']
        }
      })
      wrapper.vm.selectOption(wrapper.vm.options[0])
      expect(wrapper.vm.innerValue).toEqual('1')
    })
    test('should add selected value to innerValue when multiple: true', () => {
      const wrapper = shallowMount(Comp, {
        propsData: {
          value: ['3'],
          options: ['1', '2', '3'],
          multiple: true
        }
      })
      wrapper.vm.selectOption(wrapper.vm.options[0])
      expect(wrapper.vm.innerValue).toEqual(['3', '1'])
    })
    test('should toggle selected value in innerValue when multiple: true', () => {
      const wrapper = shallowMount(Comp, {
        propsData: {
          value: ['3', '1'],
          options: ['1', '2', '3'],
          multiple: true
        }
      })
      wrapper.vm.selectOption(wrapper.vm.options[0])
      expect(wrapper.vm.innerValue).toEqual(['3'])
    })
  })

  describe('search', () => {
    test('should filter options by search string', () => {
      const wrapper = shallowMount(Comp, {
        propsData: {
          options: ['cat', 'duck', 'dog']
        }
      })
      wrapper.vm.searchString = 'do'
      expect(wrapper.vm.filteredOptions).toEqual(['dog'])
    })

    test('should be case insensitive', () => {
      const wrapper = shallowMount(Comp, {
        propsData: {
          options: ['cat', 'duck', 'dog']
        }
      })
      wrapper.vm.searchString = 'DO'
      expect(wrapper.vm.filteredOptions).toEqual(['dog'])
    })

    test('should ignore spaces', () => {
      const wrapper = shallowMount(Comp, {
        propsData: {
          options: ['cat', 'duck', 'dog']
        }
      })
      wrapper.vm.searchString = 'd o'
      expect(wrapper.vm.filteredOptions).toEqual(['dog'])
    })

    test('should display filtered options', () => {
      const wrapper = shallowMount(Comp, {
        propsData: {
          options: ['cat', 'duck', 'dog']
        }
      })
      wrapper.vm.searchString = 'do'
      const filteredOptions = wrapper.findAll('.ds-select-option')
      expect(filteredOptions.length).toEqual(1)
    })

    test('should work when using search input', () => {
      const wrapper = shallowMount(Comp, {
        propsData: {
          options: ['cat', 'duck', 'dog']
        }
      })
      const searchInput = wrapper.find('.ds-select-search')
      searchInput.setValue('do')
      expect(wrapper.vm.filteredOptions).toEqual(['dog'])
    })
  })

  describe('pointer', () => {
    test('should be set by mouse over option', () => {
      const wrapper = shallowMount(Comp, {
        propsData: {
          options: ['1', '2', '3']
        }
      })
      const options = wrapper.findAll('.ds-select-option')
      options.at(2).trigger('mouseover')
      expect(wrapper.vm.pointer).toEqual(2)
    })

    test('should be set by pointerNext', () => {
      const wrapper = shallowMount(Comp, {
        propsData: {
          options: ['1', '2', '3']
        }
      })
      wrapper.vm.pointerNext()
      expect(wrapper.vm.pointer).toEqual(1)
    })

    test('should be set to 0 by pointerNext when on last entry', () => {
      const wrapper = shallowMount(Comp, {
        propsData: {
          options: ['1', '2', '3']
        }
      })
      wrapper.vm.pointer = 2
      wrapper.vm.pointerNext()
      expect(wrapper.vm.pointer).toEqual(0)
    })

    test('should be set by pointerPrev', () => {
      const wrapper = shallowMount(Comp, {
        propsData: {
          options: ['1', '2', '3']
        }
      })
      wrapper.vm.pointer = 1
      wrapper.vm.pointerPrev()
      expect(wrapper.vm.pointer).toEqual(0)
    })

    test('should be set to last entry by pointerPrev when 0', () => {
      const wrapper = shallowMount(Comp, {
        propsData: {
          options: ['1', '2', '3']
        }
      })
      wrapper.vm.pointerPrev()
      expect(wrapper.vm.pointer).toEqual(2)
    })

    test('should be set by key down on wrap', () => {
      const wrapper = shallowMount(Comp, {
        propsData: {
          options: ['1', '2', '3']
        }
      })
      const wrap = wrapper.find('.ds-select-wrap')
      wrap.trigger('keydown.down')
      expect(wrapper.vm.pointer).toEqual(1)
    })

    test('should be set by key up on wrap', () => {
      const wrapper = shallowMount(Comp, {
        propsData: {
          options: ['1', '2', '3']
        }
      })
      const wrap = wrapper.find('.ds-select-wrap')
      wrap.trigger('keydown.up')
      expect(wrapper.vm.pointer).toEqual(2)
    })

    test('should be set by key down on search input when open', () => {
      const wrapper = shallowMount(Comp, {
        propsData: {
          options: ['1', '2', '3']
        }
      })
      wrapper.vm.open()
      const searchInput = wrapper.find('.ds-select-search')
      searchInput.trigger('keydown.down')
      expect(wrapper.vm.pointer).toEqual(1)
    })

    test('should be set by key up on search input when open', () => {
      const wrapper = shallowMount(Comp, {
        propsData: {
          options: ['1', '2', '3']
        }
      })
      wrapper.vm.open()
      const searchInput = wrapper.find('.ds-select-search')
      searchInput.trigger('keydown.up')
      expect(wrapper.vm.pointer).toEqual(2)
    })

    test('should select option by pointer value', () => {
      const wrapper = shallowMount(Comp, {
        propsData: {
          options: ['1', '2', '3']
        }
      })
      wrapper.vm.pointer = 1
      wrapper.vm.selectPointerOption()
      expect(wrapper.vm.innerValue).toEqual('2')
    })

    test('should select option by enter key on wrap', () => {
      const wrapper = shallowMount(Comp, {
        propsData: {
          options: ['1', '2', '3']
        }
      })
      wrapper.vm.pointer = 1
      const wrap = wrapper.find('.ds-select-wrap')
      wrap.trigger('keypress.enter')
      expect(wrapper.vm.innerValue).toEqual('2')
    })

    test('should select option by enter key on search input', () => {
      const wrapper = shallowMount(Comp, {
        propsData: {
          options: ['1', '2', '3']
        }
      })
      wrapper.vm.pointer = 1
      const searchInput = wrapper.find('.ds-select-search')
      searchInput.trigger('keypress.enter')
      expect(wrapper.vm.innerValue).toEqual('2')
    })
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(Comp, {
      propsData: {
        value: '1',
        options: ['1', '2', '3']
      }
    })
    expect(wrapper.element).toMatchSnapshot()
  })
})