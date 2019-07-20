import fetch, { Response } from 'node-fetch'

import fs from 'fs'
import path from 'path'
import { createTestClient } from 'apollo-server-testing'
import createServer from '../../server'
import { gql } from '../../jest/helpers'

jest.mock('node-fetch')

let variables = {}

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
              logo
              sources
            }
          }
        `
        return query({ query: embed, variables })
      }
    })

    describe('given a youtube link', () => {
      beforeEach(() => {
        const youtubeHtml = fs.readFileSync(
          path.join(__dirname, './embeds/snapshots/babyLovesCat.html'),
          'utf8',
        )
        const embedJson = fs.readFileSync(
          path.join(__dirname, './embeds/snapshots/oembed/babyLovesCat.json'),
          'utf8',
        )
        fetch
          .mockReturnValueOnce(Promise.resolve(new Response(youtubeHtml)))
          .mockReturnValueOnce(Promise.resolve(new Response(embedJson)))
        variables = { url: 'https://www.youtube.com/watch?v=qkdXAtO40Fo&t=18s' }
      })

      it('returns meta data', async () => {
        const expected = expect.objectContaining({
          data: {
            embed: {
              type: 'link',
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
              logo: 'https://www.youtube.com/yts/img/favicon_144-vfliLAfaB.png',
              sources: ['resource'],
            },
          },
        })
        await expect(embedAction(variables)).resolves.toEqual(expected)
      })
    })
  })
})
