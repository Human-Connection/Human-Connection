import Vue from 'vue'
import VueRouter from 'vue-router'
import { mount } from '@vue/test-utils'
import { h32 as hash } from 'xxhashjs'
import MutationObserver from 'mutation-observer'

import Editor from './Editor'

global.MutationObserver = MutationObserver

const localVue = global.localVue
localVue.use(VueRouter)

const localStorage = global.localStorage

describe('Editor.vue', () => {
  let wrapper
  let propsData
  let mocks
  let router

  const Wrapper = () => {
    return (wrapper = mount(Editor, {
      mocks,
      propsData,
      router,
      localVue,
      sync: false,
      stubs: {
        transition: false,
      },
    }))
  }

  describe('mount', () => {
    beforeEach(() => {
      propsData = {}
      mocks = {
        $t: (t) => t,
      }
      wrapper = Wrapper()
    })

    it('renders', () => {
      expect(Wrapper().is('div')).toBe(true)
    })

    describe('given a piece of text', () => {
      beforeEach(() => {
        propsData.value = 'I am a piece of text'
      })

      it('renders', async () => {
        wrapper = Wrapper()
        await Vue.nextTick().then(() => {
          expect(wrapper.find('.editor-content').text()).toContain(propsData.value)
        })
      })
    })

    it('translates the placeholder', () => {
      expect(wrapper.vm.editor.extensions.options.placeholder.emptyNodeText).toEqual(
        'editor.placeholder',
      )
    })

    describe('optional extensions', () => {
      it('sets the Mention items to the users', () => {
        propsData.users = [
          {
            id: 'u345',
          },
        ]
        wrapper = Wrapper()
        expect(wrapper.vm.editor.extensions.options.mention.items()).toEqual(propsData.users)
      })

      it('mentions is not an option when there are no users', () => {
        expect(wrapper.vm.editor.extensions.options).toEqual(
          expect.not.objectContaining({
            mention: expect.anything(),
          }),
        )
      })

      describe('limists suggestion list to 15 users', () => {
        beforeEach(() => {
          const manyUsersList = []
          for (let i = 0; i < 25; i++) {
            manyUsersList.push({ id: `user${i}` })
          }
          propsData.users = manyUsersList
          wrapper = Wrapper()
        })

        it('when query is empty', () => {
          expect(
            wrapper.vm.editor.extensions.options.mention.onFilter(propsData.users),
          ).toHaveLength(15)
        })

        it('when query is present', () => {
          expect(
            wrapper.vm.editor.extensions.options.mention.onFilter(propsData.users, 'user'),
          ).toHaveLength(15)
        })
      })

      it('sets the Hashtag items to the hashtags', () => {
        propsData.hashtags = [
          {
            id: 'Frieden',
          },
        ]
        wrapper = Wrapper()
        expect(wrapper.vm.editor.extensions.options.hashtag.items()).toEqual(propsData.hashtags)
      })

      it('hashtags is not an option when there are no hashtags', () => {
        expect(wrapper.vm.editor.extensions.options).toEqual(
          expect.not.objectContaining({
            hashtag: expect.anything(),
          }),
        )
      })

      describe('limists suggestion list to 15 hashtags', () => {
        beforeEach(() => {
          const manyHashtagsList = []
          for (let i = 0; i < 25; i++) {
            manyHashtagsList.push({ id: `hashtag${i}` })
          }
          propsData.hashtags = manyHashtagsList
          wrapper = Wrapper()
        })

        it('when query is empty', () => {
          expect(
            wrapper.vm.editor.extensions.options.hashtag.onFilter(propsData.hashtags),
          ).toHaveLength(15)
        })

        it('when query is present', () => {
          expect(
            wrapper.vm.editor.extensions.options.hashtag.onFilter(propsData.hashtags, 'hashtag'),
          ).toHaveLength(15)
        })
      })
    })
  })

  describe(':autosave', () => {
    const getFirstInStorage = () => {
      const storageKey = Object.keys(localStorage)[0]
      const value = localStorage[storageKey]
      return {
        storageKey,
        value,
      }
    }

    beforeAll(() => jest.useFakeTimers())
    afterAll(() => jest.useRealTimers())

    describe('when false (default)', () => {
      const content = '<p>NOOP WIP</p>'

      beforeEach(async () => {
        propsData = {
          // <hc-editor :autosave="false|true" />
          // plugin ignores all changes (transactions) on this instance
          // autosave: false (default)
        }
        mocks = {
          $t: (t) => t,
        }

        // testing against localStorage, so letting
        // the editor do its thing without keeping
        // a reference is enough
        Wrapper().vm.editor.setContent(content, true)

        await jest.runAllTimers()
      })

      it('does nothing', () => {
        expect(Object.keys(localStorage).length).toBe(0)
      })
    })

    describe('when creating a post', () => {
      const content = '<p>Post WIP</p>'

      beforeEach(async () => {
        propsData = {
          autosave: true,
        }
        mocks = {
          $t: (t) => t,
        }

        // plugin creates storage ids from $route.path
        router = new VueRouter({
          routes: [{ path: 'post/create' }],
        })
        router.push('/post/create')

        Wrapper().vm.editor.setContent(content, true)
        await jest.runAllTimers()
      })

      afterAll(() => {
        localStorage.clear()
      })

      it('saves editor content to localStorage on input', async () => {
        const { value } = getFirstInStorage()
        expect(value).toBe(content)
      })

      it('generates a temporary id for the post', () => {
        const { storageKey } = getFirstInStorage()
        expect(storageKey).toMatch(/^autosave:post:[a-f\d]{7,8}$/)
      })

      it('stores temporary id of last edit', () => {
        const lastEditedId = localStorage.getItem('autosave:post:last')
        expect(lastEditedId).toMatch(/^[a-f\d]{7,8}$/)
      })

      it('loads last edited autosave', () => {
        const wrapper = Wrapper()
        const lastId = localStorage.getItem('autosave:post:last')
        const autosaveHTML = localStorage.getItem(`autosave:post:${lastId}`)
        expect(wrapper.vm.editor.getHTML()).toBe(autosaveHTML)
      })
    })

    describe('when editing a post', () => {
      const contentValue = '<p>Post WIP</p>'
      const content = '<p>Post WIP autosaved</p>'
      const postId = '4b3de466-ddab-487f-bd82-2839280bb56c'
      const hashedPostId = hash(postId, 0xb0b).toString(16)

      beforeEach(async () => {
        propsData = {
          autosave: true,
          value: contentValue,
        }
        mocks = {
          $t: (t) => t,
        }

        // plugin creates storage ids from $route.path
        router = new VueRouter({
          routes: [{ path: `/post/edit/${postId}}` }],
        })
        router.push(`/post/edit/${postId}`)

        Wrapper().vm.editor.setContent(content, true)
        await jest.runAllTimers()
      })

      afterAll(() => {
        localStorage.clear()
      })

      it('saves editor content to localStorage on input', async () => {
        const { value } = getFirstInStorage()
        expect(value).toBe(content)
      })

      it("uses post's id for storageKey", () => {
        const { storageKey } = getFirstInStorage()
        expect(storageKey).toBe(`autosave:post:${hashedPostId}`)
      })

      it('does not mark itself as last edit', () => {
        const lastEditedId = localStorage.getItem('autosave:post:last')
        expect(lastEditedId).not.toBe(hashedPostId)
      })

      it('does not load the autosave', () => {
        const wrapper = Wrapper()
        expect(wrapper.vm.editor.getHTML()).toBe(contentValue)
      })
    })

    describe('when editing a comment', () => {
      const postId = '33739246-fa27-42ae-94de-2f590a2d92c4'
      const content = '<p>Comment WIP</p>'

      beforeEach(async () => {
        propsData = {
          autosave: true,
        }
        mocks = {
          $t: (t) => t,
        }
        router = new VueRouter({
          routes: [{ path: `/post/${postId}/foo-title-slug` }],
        })
        router.push(`/post/${postId}/foo-title-slug`)
        Wrapper().vm.editor.setContent(content, true)
        await jest.runAllTimers()
      })

      afterAll(() => {
        localStorage.clear()
      })

      it('saves editor content to localStorage on input', async () => {
        const { storageKey, value } = getFirstInStorage()
        expect(storageKey).toMatch(/autosave:comment:[a-f\d]{7,8}/)
        expect(value).toBe(content)
      })

      it('loads an existing autosave', () => {
        const { value: autosaveHTML } = getFirstInStorage()
        const _wrapper = Wrapper()
        expect(_wrapper.vm.editor.getHTML()).toBe(autosaveHTML)
      })
    })
  })
})
