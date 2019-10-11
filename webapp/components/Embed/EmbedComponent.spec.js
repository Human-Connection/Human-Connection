import { mount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import Styleguide from '@human-connection/styleguide'
import EmbedComponent from './EmbedComponent'

let wrapper, propsData, getters, mocks
const someUrl = 'https://www.youtube.com/watch?v=qkdXAtO40Fo'
const localVue = createLocalVue()

localVue.use(Vuex)
localVue.use(Styleguide)

describe('EmbedComponent.vue', () => {
  const Wrapper = () => {
    const store = new Vuex.Store({
      getters,
    })
    return mount(EmbedComponent, { propsData, localVue, store, mocks })
  }

  beforeEach(() => {
    mocks = {
      $t: a => a,
      $apollo: {
        mutate: jest
          .fn()
          .mockResolvedValueOnce({ data: { UpdateUser: { allowEmbedIframes: true } } }),
      },
      $toast: {
        success: jest.fn(),
        error: jest.fn(),
      },
    }
    propsData = {}
    getters = {
      'auth/user': () => {
        return { id: 'u5', allowEmbedIframes: false }
      },
    }
  })

  describe('given a href only for a link ', () => {
    beforeEach(() => {
      propsData.embedData = {
        __typename: 'Embed',
        type: 'link',
        title: '👻 ✉️ Bruno... le ciel sur répondeur ! 🔮 🧠 - Clément FREZE',
        author: null,
        publisher: 'PeerTube.social',
        date: null,
        description:
          'Salut tout le monde ! Aujourd’hui, une vidéo sur le scepticisme, nous allons parler médiumnité avec le cas de Bruno CHARVET : « Bruno, un nouveau message ». Merci de rester respectueux dans les commentaires : SOURCES : Les sources des vi...',
        url: 'https://peertube.social/videos/watch/f3cb1945-a8f7-481f-a465-946c6f884e50',
        image: 'https://peertube.social/static/thumbnails/f3cb1945-a8f7-481f-a465-946c6f884e50.jpg',
        audio: null,
        video: null,
        lang: 'fr',
        sources: ['resource', 'oembed'],
        html: null,
      }
      wrapper = Wrapper()
    })

    it('shows the title', () => {
      expect(wrapper.find('h4').text()).toBe(
        '👻 ✉️ Bruno... le ciel sur répondeur ! 🔮 🧠 - Clément FREZE',
      )
    })

    it('shows the description', () => {
      expect(wrapper.find('.embed-content p').text()).toBe(
        'Salut tout le monde ! Aujourd’hui, une vidéo sur le scepticisme, nous allons parler médiumnité avec le cas de Bruno CHARVET : « Bruno, un nouveau message ». Merci de rester respectueux dans les commentaires : SOURCES : Les sources des vi...',
      )
    })

    it('shows preview Images for link', () => {
      expect(wrapper.find('.embed-preview-image').exists()).toBe(true)
    })
  })

  describe('given a href with embed html', () => {
    describe('onEmbed returned title and description', () => {
      beforeEach(() => {
        propsData.embedData = {
          __typename: 'Embed',
          title: 'Baby Loves Cat',
          description:
            'She’s incapable of controlling her limbs when her kitty is around. The obsession grows every day. Ps. That’s a sleep sack she’s in. Not a starfish outfit. Al...',
        }
        wrapper = Wrapper()
      })

      it('show the title', () => {
        expect(wrapper.find('h4').text()).toBe('Baby Loves Cat')
      })

      it('show the desciption', () => {
        expect(wrapper.find('.embed-content p').text()).toBe(
          'She’s incapable of controlling her limbs when her kitty is around. The obsession grows every day. Ps. That’s a sleep sack she’s in. Not a starfish outfit. Al...',
        )
      })

      describe('onEmbed returned embed data with html', () => {
        beforeEach(() => {
          propsData.embedData = {
            __typename: 'Embed',
            type: 'video',
            title: 'Baby Loves Cat',
            author: 'Merkley Family',
            publisher: 'YouTube',
            date: '2015-08-16T00:00:00.000Z',
            description:
              'She’s incapable of controlling her limbs when her kitty is around. The obsession grows every day. Ps. That’s a sleep sack she’s in. Not a starfish outfit. Al...',
            url: someUrl,
            image: 'https://i.ytimg.com/vi/qkdXAtO40Fo/maxresdefault.jpg',
            audio: null,
            video: null,
            lang: 'de',
            sources: ['resource', 'oembed'],
            html:
              '<iframe width="480" height="270" src="https://www.youtube.com/embed/qkdXAtO40Fo?feature=oembed" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen=""></iframe>',
          }
          wrapper = Wrapper()
        })

        it('shows a simple link when a user closes the embed preview', () => {
          wrapper.find('.embed-close-button').trigger('click')
          expect(wrapper.vm.showLinkOnly).toBe(true)
        })

        it('opens the data privacy overlay when a user clicks on the preview image', () => {
          wrapper.find('.embed-preview-image--clickable').trigger('click')
          expect(wrapper.vm.showOverlay).toBe(true)
        })

        describe('shows iframe', () => {
          beforeEach(() => {
            wrapper.setData({ showOverlay: true })
          })

          it('when user agress', () => {
            wrapper.find('.ds-button-primary').trigger('click')
            expect(wrapper.vm.showEmbed).toBe(true)
          })

          it('does not show iframe when user clicks to cancel', () => {
            wrapper.find('.ds-button-ghost').trigger('click')
            expect(wrapper.vm.showEmbed).toBe(false)
          })

          describe("doesn't set permanently", () => {
            beforeEach(() => {
              wrapper.find('.ds-button-primary').trigger('click')
            })

            it("if user doesn't give consent", () => {
              expect(wrapper.vm.checkedAlwaysAllowEmbeds).toBe(false)
            })

            it("doesn't update the user's profile", () => {
              expect(mocks.$apollo.mutate).not.toHaveBeenCalled()
            })
          })

          describe('sets permanently', () => {
            beforeEach(() => {
              wrapper.find('input[type=checkbox]').trigger('click')
              wrapper.find('.ds-button-primary').trigger('click')
            })

            it('changes setting permanetly when user requests', () => {
              expect(wrapper.vm.checkedAlwaysAllowEmbeds).toBe(true)
            })

            it("updates the user's profile", () => {
              expect(mocks.$apollo.mutate).toHaveBeenCalledTimes(1)
            })
          })
        })

        describe('immediately shows', () => {
          beforeEach(() => {
            getters = {
              'auth/user': () => {
                return { id: 'u5', allowEmbedIframes: true }
              },
            }
            wrapper = Wrapper()
          })

          it('sets showEmbed to true', () => {
            expect(wrapper.vm.showEmbed).toBe(true)
          })

          it('the iframe returned from oEmbed', () => {
            expect(wrapper.find('iframe').html()).toEqual(propsData.embedData.html)
          })

          it('does not display image to click', () => {
            expect(wrapper.find('.embed-preview-image--clickable').exists()).toBe(false)
          })
        })
      })
    })
  })
})
