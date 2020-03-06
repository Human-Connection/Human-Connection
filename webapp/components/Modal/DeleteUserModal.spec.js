/*
import { mount } from '@vue/test-utils'
import Vuex from 'vuex'
 
 
import DeleteUserModal from './DeleteUserModal.vue'
 
const localVue = global.localVue

 
describe('ConfirmModal.vue', () => {
    let getters, mutations, mocks, propsData
   

  beforeEach(() => {
    propsData = {
      type: 'user',
      id: 'u23',
      name: 'Huey',
      slug: 'huey',
      avatar: 'link',
      contributionsCount: 2,
      commentedCount: 3,
      createdAt: 'datum',
     
       
    }
    mocks = {
        $t: jest.fn(str => str),
        $i18n: {
          locale: () => 'en',
        },
        $router: {
          push: jest.fn(),
        },
      }
  })

   

  describe('mount', () => {
    mutations = {
        'modal/SET_OPEN': jest.fn(),
      }
      getters = {
        'auth/isModerator': () => false,
        'auth/isAdmin': () => false,
      }
 
        const store = new Vuex.Store({ mutations, getters })
        const wrapper = mount(DeleteUserModal, {
          propsData: {
            ...values,
          },
          mocks,
          store,
          localVue,
        })
        console.log("wrapper", wrapper)
       // menuToggle = wrapper.find('[data-test="content-menu-button"]')
        // menuToggle.trigger('click')
        //return wrapper
    


    describe('owner of contribution', () => {
        let wrapper
        beforeEach(() => {
          wrapper = openContentMenu({
            isOwner: true,
            resourceType: 'contribution',
            resource: {
              id: 'd23a4265-f5f7-4e17-9f86-85f714b4b9f8',
            },
          })
          openModalSpy = jest.spyOn(wrapper.vm, 'openModal')
        })
  
       
  
      
      })
})


})
*/
