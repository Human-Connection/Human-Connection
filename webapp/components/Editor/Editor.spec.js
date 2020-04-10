import Vue from 'vue'
import VueRouter from 'vue-router'
import { mount } from '@vue/test-utils'
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

  beforeEach(() => {
    propsData = {}
    mocks = {
      $t: () => 'some cool placeholder',
    }
    wrapper = Wrapper()
  })

  describe('mount', () => {
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
        'some cool placeholder',
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
    const getFirst = () => {
      const storageKey = Object.keys(localStorage)[0]
      const value = localStorage[storageKey]
      return {
        storageKey,
        value,
      }
    }

    beforeAll(() => jest.useFakeTimers())
    afterAll(() => jest.useRealTimers())

    describe('when false', () => {
      let routerWrapper

      beforeEach(() => {
        router = new VueRouter({
          routes: [{ path: 'post/create' }],
        })
        router.push('/post/create')
        propsData.autosave = false
        routerWrapper = Wrapper()
      })

      it('does nothing', () => {
        const content = '<p>NOOP WIP</p>'

        routerWrapper.vm.editor.setContent(content, true)
        jest.runAllTimers()

        expect(Object.keys(localStorage).length).toBe(0)
      })
    })

    describe('when editing a post', () => {
      const content = '<p>Post WIP</p>'

      beforeEach(async () => {
        router = new VueRouter({
          routes: [{ path: 'post/create' }],
        })
        router.push('/post/create')

        Wrapper().vm.editor.setContent(content, true)
        await jest.runAllTimers()
      })

      afterEach(() => {
        localStorage.clear()
      })

      it('saves editor content to localStorage on input', async () => {
        const { storageKey, value } = getFirst()
        expect(storageKey.startsWith('draft:post:')).toBe(true)
        expect(value).toBe(content)
      })
    })

    describe('when editing a comment', () => {
      const postId = '33739246-fa27-42ae-94de-2f590a2d92c4'
      const content = '<p>Comment WIP</p>'

      beforeEach(async () => {
        router = new VueRouter({
          routes: [{ path: `/post/${postId}/foo-title-slug` }],
        })
        router.push(`/post/${postId}/foo-title-slug`)

        Wrapper().vm.editor.setContent(content, true)
        await jest.runAllTimers()
      })

      afterEach(() => {
        localStorage.clear()
      })

      it('saves editor content to localStorage on input', async () => {
        const { storageKey, value } = getFirst()
        expect(storageKey).toBe(`draft:${postId}`)
        expect(value).toBe(content)
      })
    })
  })
})
