// import { shallowMount, mount, createLocalVue } from '@vue/test-utils'
import { mount, createLocalVue } from '@vue/test-utils'
// import PostMutationHelpers from '~/mixins/PostMutationHelpers'
import PostSlug from './_slug.vue'
// import Vue from 'vue'
import Vuex from 'vuex'
import Styleguide from '@human-connection/styleguide'
import VueRouter from 'vue-router'

const routes = [
  {
    path: '/',
  },
]
const router = new VueRouter({
  routes,
})
const localVue = createLocalVue()

localVue.use(Vuex)
localVue.use(Styleguide)
localVue.use(VueRouter)

describe('PostSlug', () => {
  let wrapper
  let Wrapper
  let propsData
  let mocks

  beforeEach(() => {
    propsData = {}
    mocks = {
      post: {
        id: 'p23',
      },
      $t: jest.fn(),
      // $filters: {
      //   truncate: a => a
      // },
      // $router: {
      //   history: {
      //     push: jest.fn(),
      //   },
      // },
      $toast: {
        success: () => {},
        error: () => {},
      },
      $apollo: {
        mutate: jest.fn().mockResolvedValue(),
      },
    }
  })

  // describe('shallowMount', () => {
  //   Wrapper = () => {
  //     return shallowMount(PostSlug, {
  //       propsData,
  //       mocks,
  //       localVue,
  //       router,
  //     })
  //   }
  //   describe('given a post', () => {
  //     beforeEach(() => {
  //       // propsData = {
  //       //   type: 'contribution',
  //       //   id: 'p23',
  //       //   name: 'It is a post',
  //       //   // callbacks: {
  //       //   //   confirm: () => Post.methods.deletePostCallback('list'),
  //       //   //   cancel: null
  //       //   // }
  //       // }
  //       mocks = {
  //         ...mocks,
  //         post: {
  //           id: 'p23',
  //           name: 'It is a post',
  //         },
  //       }
  //     })

  //     it('mentions post title', () => {
  //       wrapper = Wrapper()
  //       wrapper.vm.deletePostCallback('list')

  //       console.log('mocks.$t: ', mocks.$t)
  //       const calls = mocks.$t.mock.calls
  //       const expected = [
  //         [
  //           'delete.contribution.message',
  //           {
  //             name: 'It is a post',
  //           },
  //         ],
  //       ]
  //       expect(calls).toEqual(expect.arrayContaining(expected))
  //     })
  //   })

  //   // describe('given a comment', () => {
  //   //   beforeEach(() => {
  //   //     propsData = {
  //   //       type: 'comment',
  //   //       id: 'c3',
  //   //       name: 'It is the user of the comment'
  //   //     //   callbacks: {
  //   //     //     confirm: () => Post.methods.deletePostCallback('list'),
  //   //     //     cancel: null
  //   //     //   }
  //   //     }
  //   //   })

  //   //   it('mentions comments user name', () => {
  //   //     Wrapper()
  //   //     const calls = mocks.$t.mock.calls
  //   //     const expected = [
  //   //       ['delete.comment.message', { name: 'It is the user of the comment' }]
  //   //     ]
  //   //     expect(calls).toEqual(expect.arrayContaining(expected))
  //   //   })
  //   // })
  // })

  describe('mount', () => {
    Wrapper = () => {
      return mount(PostSlug, {
        propsData,
        mocks,
        localVue,
        router,
      })
    }

    beforeEach(jest.useFakeTimers)

    it('renders', () => {
      // console.log(Wrapper().vm)
      expect(Wrapper().is('div')).toBe(true)
    })

    describe('test mixin "PostMutationHelpers"', () => {
      beforeEach(() => {
        wrapper = Wrapper()
      })

      describe('deletion of Post from List by invoking "deletePostCallback(`list`)"', () => {
        beforeEach(() => {
          wrapper.vm.deletePostCallback('list')
        })

        describe('after timeout', () => {
          beforeEach(jest.runAllTimers)

          it('emits "deletePost"', () => {
            expect(wrapper.emitted().deletePost).toBeTruthy()
          })

          it.todo('does not go to index (main) page')
          // it('does not go to index (main) page', () => {
          //   expect(mocks.$router.history.push).not.toHaveBeenCalled()
          // })

          it('does call mutation', () => {
            expect(mocks.$apollo.mutate).toHaveBeenCalledTimes(1)
            // expect(mocks.$toast.success).toHaveBeenCalledTimes(1)
          })
        })
      })

      describe('deletion of Post from Page by invoking "deletePostCallback(`page`)"', () => {
        beforeEach(() => {
          wrapper.vm.deletePostCallback('page')
        })

        describe('after timeout', () => {
          beforeEach(jest.runAllTimers)

          // it('fades away', () => {
          //   expect(wrapper.vm.isOpen).toBe(false)
          // })

          it('not emits "deletePost"', () => {
            expect(wrapper.emitted().deletePost).toBeFalsy()
          })

          it.todo('does go to index (main) page')
          // it('does go to index (main) page', () => {
          //   expect(mocks.$router.history.push).toHaveBeenCalled()
          // })

          it('does call mutation', () => {
            expect(mocks.$apollo.mutate).toHaveBeenCalled()
            // expect(mocks.$toast.success).toHaveBeenCalledTimes(1)
          })
        })
      })
    })
  })
})
