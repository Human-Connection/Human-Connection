// test.js

// Import the `mount()` method from the test utils
// and the component you want to test
import { mount } from '@vue/test-utils'
import Counter from './counter'

// Now mount the component and you have the wrapper
const wrapper = mount(Counter)

// You can access the actual Vue instance via `wrapper.vm`
const vm = wrapper.vm

// To inspect the wrapper deeper just log it to the console
// and your adventure with the Vue Test Utils begins
console.log(wrapper)