import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'
import { createTestClient } from 'apollo-server-testing'
import createServer from '../../server'
import { gql } from '../../jest/helpers'

jest.mock('node-fetch')
const { Response } = jest.requireActual('node-fetch')

let variables = {}

const pr960 = fs.readFileSync(
  path.join(__dirname, '../../jest/snapshots/embeds/pr960.html'),
  'utf8',
)
const babyLovesCat = fs.readFileSync(
  path.join(__dirname, '../../jest/snapshots/embeds/babyLovesCat.html'),
  'utf8',
)

const babyLovesCatEmbedResponse = new Response(
  JSON.stringify({
    height: 270,
    provider_name: 'YouTube',
    title: 'Baby Loves Cat',
    type: 'video',
    width: 480,
    thumbnail_height: 360,
    provider_url: 'https://www.youtube.com/',
    thumbnail_width: 480,
    html:
      '<iframe width="480" height="270" src="https://www.youtube.com/embed/qkdXAtO40Fo?start=18&feature=oembed" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
    thumbnail_url: 'https://i.ytimg.com/vi/qkdXAtO40Fo/hqdefault.jpg',
    version: '1.0',
    author_name: 'Merkley Family',
    author_url: 'https://www.youtube.com/channel/UC5P8yei950tif7UmdPpkJLQ',
  }),
)

describe('Query', () => {
  describe('embed', () => {
    let embedAction

    beforeEach(() => {
      embedAction = async variables => {
        const { server } = createServer({
          context: () => {},
        })
        const { query } = createTestClient(server)
        const embed = gql`
          query($url: String!) {
            embed(url: $url) {
              type
              title
              author
              publisher
              date
              description
              url
              image
              audio
              video
              lang
              sources
              html
            }
          }
        `
        return query({ query: embed, variables })
      }
    })

    describe('given a Github link', () => {
      beforeEach(() => {
        fetch
          .mockReturnValueOnce(Promise.resolve(new Response(pr960)))
        variables = { url: "https://github.com/Human-Connection/Human-Connection/pull/960" }
      })

      it('returns meta data even if no embed html can be retrieved', async () => {
        const expected = expect.objectContaining({
          data: {
            embed: {
              "type": "link",
              "title": "Editor embeds merge in nitro embed by mattwr18 · Pull Request #960 · Human-Connection/Human-Connection",
              "author": "Human-Connection",
              "publisher": "GitHub",
              "date": "2019-07-21T00:56:00.000Z",
              "description": "🍰 Pullrequest Issues fixes #256",
              "url": "https://github.com/Human-Connection/Human-Connection/pull/960",
              "image": "https://repository-images.githubusercontent.com/112590397/52c9a000-7e11-11e9-899d-aaa55f3a3d72",
              "audio": null,
              "video": null,
              "lang": "en",
              "sources": [
                "resource"
              ],
              "html": null
            },
          },
        })
        await expect(embedAction(variables)).resolves.toEqual(expected)
      })
    })

    describe('given a youtube link', () => {
      beforeEach(() => {
        fetch
          .mockReturnValueOnce(Promise.resolve(new Response(babyLovesCat)))
          .mockReturnValueOnce(Promise.resolve(babyLovesCatEmbedResponse))
        variables = { url: 'https://www.youtube.com/watch?v=qkdXAtO40Fo&t=18s' }
      })

      it('returns meta data plus youtube iframe html', async () => {
        const expected = expect.objectContaining({
          data: {
            embed: {
              type: 'video',
              title: 'Baby Loves Cat',
              author: 'Merkley Family',
              publisher: 'YouTube',
              date: '2015-08-16T00:00:00.000Z',
              description:
                'She’s incapable of controlling her limbs when her kitty is around. The obsession grows every day. Ps. That’s a sleep sack she’s in. Not a starfish outfit. Al...',
              url: 'https://www.youtube.com/watch?v=qkdXAtO40Fo',
              image: 'https://i.ytimg.com/vi/qkdXAtO40Fo/maxresdefault.jpg',
              audio: null,
              video: null,
              lang: 'de',
              sources: ['resource', 'oembed'],
              html:
                '<iframe width="480" height="270" src="https://www.youtube.com/embed/qkdXAtO40Fo?start=18&feature=oembed" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
            },
          },
        })
        await expect(embedAction(variables)).resolves.toEqual(expected)
      })
    })
  })
})
