import { mount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import Styleguide from '@human-connection/styleguide'
import EmbedComponent from './EmbedComponent'

let Wrapper, wrapper, propsData, getters, mocks
const someUrl = 'https://www.youtube.com/watch?v=qkdXAtO40Fo'
const localVue = createLocalVue()

localVue.use(Vuex)
localVue.use(Styleguide)

describe('EmbedComponent.vue', () => {
  beforeEach(() => {
    mocks = {
      $t: a => a,
    }
    propsData = {}
    getters = {
      'auth/user': () => {
        return { id: 'u5', allowEmbedIframes: false }
      },
    }
    Wrapper = ({ propsData }) => {
      const store = new Vuex.Store({
        getters,
      })
      return mount(EmbedComponent, { propsData, localVue, store, mocks })
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
      wrapper = Wrapper({ propsData })
    })

    it.only('show the title', () => {
      expect(wrapper.find('h4').text()).toBe(
        '👻 ✉️ Bruno... le ciel sur répondeur ! 🔮 🧠 - Clément FREZE',
      )
    })

    it.only('show the desciption', () => {
      expect(wrapper.find('.embed-content p').text()).toBe(
        'Salut tout le monde ! Aujourd’hui, une vidéo sur le scepticisme, nous allons parler médiumnité avec le cas de Bruno CHARVET : « Bruno, un nouveau message ». Merci de rester respectueux dans les commentaires : SOURCES : Les sources des vi...',
      )
    })

    it.only('show preview Images for link', () => {
      expect(wrapper.find('.embed-preview-image--clickable')).toEqual({
        selector: '.embed-preview-image--clickable',
      })
    })
  })

  describe('given a href wite embed html', () => {
    describe('onEmbed returned title and description', () => {
      beforeEach(() => {
        propsData.embedData = {
          __typename: 'Embed',
          title: 'Baby Loves Cat',
          description:
            'She’s incapable of controlling her limbs when her kitty is around. The obsession grows every day. Ps. That’s a sleep sack she’s in. Not a starfish outfit. Al...',
        }
        wrapper = Wrapper({ propsData })
      })

      it.only('show the title', () => {
        expect(wrapper.find('h4').text()).toBe('Baby Loves Cat')
      })

      it.only('show the desciption', () => {
        expect(wrapper.find('.embed-content p').text()).toBe(
          'She’s incapable of controlling her limbs when her kitty is around. The obsession grows every day. Ps. That’s a sleep sack she’s in. Not a starfish outfit. Al...',
        )
      })
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
            '<iframe width="480" height="270" src="https://www.youtube.com/embed/qkdXAtO40Fo?feature=oembed" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
        }
        wrapper = Wrapper({ propsData })
      })

      it('shows a simple link when a user closes the embed preview', () => {
        wrapper.find('.embed-close-button').trigger('click')
        expect(wrapper.vm.showLinkOnly).toBe(true)
      })

      it.only('opens the data privacy overlay when a user clicks on the preview image', () => {
        wrapper.find('.embed-preview-image--clickable').trigger('click')
        expect(wrapper.vm.showOverlay).toBe(true)
      })

      it.only('click show iframe and change NOT setting permanetly', () => {
        wrapper.setData({ showOverlay: true })
        wrapper.find('.ds-button-primary').trigger('click')
        expect(wrapper.vm.showEmbed).toBe(true)
        expect(wrapper.vm.checkedAlwaysAllowEmbeds).toBe(false)
      })

      it.only('click show iframe and change setting permanetly', () => {
        wrapper.setData({ showOverlay: true })
        wrapper.find('input[type=checkbox]').trigger('click')
        wrapper.find('.ds-button-primary').trigger('click')
        expect(wrapper.vm.showEmbed).toBe(true)
        expect(wrapper.vm.checkedAlwaysAllowEmbeds).toBe(true)
      })

      it.only('show only iframe if allowEmbedIframes true', () => {
        wrapper.setData({ allowEmbedIframes: true })
        expect(wrapper.find('.embed-html')).toEqual({ selector: '.embed-html' })
        expect(wrapper.find('.embed-preview-image--clickable')).toEqual({})
      })
    })
  })
})
