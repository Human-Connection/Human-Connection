import { request } from 'graphql-request'
import { create, cleanDatabase } from './seed/factories'
import { host } from './jest/helpers'

describe('filter for searchQuery', () => {
  const query = (searchQuery) => {
    return `
    {
      findPosts(filter: "${searchQuery}", limit: 10) {
        title
      }
    }
    `
  }

  describe('given some posts', () => {
    beforeEach(async () => {
      await create('post', {
        title: 'Hamlet',
        content: 'To be, or not to be: that is the question'
      })
      await create('post', {
        title: 'Threepenny Opera',
        content: 'And the shark, it has teeth, And it wears them in the face.'
      })
    })

    afterEach(async () => {
      await cleanDatabase()
    })

    describe('sanitization', () => {
      it('escapes cypher statement', async () => {
        await request(host, query(`'');
          MATCH (n) OPTIONAL MATCH (n)-[r]-() DELETE n,r;
          CALL db.index.fulltext.queryNodes('full_text_search', ''
        `))
        const data = await request(host, query('the'))
        expect(data).toEqual({ findPosts: [{ title: 'Hamlet' }, { title: 'Threepenny Opera' }] })
      })
    })

    describe('result set', () => {
      describe('includes posts if search term', () => {
        it('matches title', async () => {
          const data = await request(host, query('Hamlet'))
          expect(data).toEqual({ findPosts: [{ title: 'Hamlet' }] })
        })

        it('matches mistyped title', async () => {
          const data = await request(host, query('amlet'))
          expect(data).toEqual({ findPosts: [{ title: 'Hamlet' }] })
        })

        it('matches a part of the content', async () => {
          const data = await request(host, query('shark'))
          expect(data).toEqual({ findPosts: [{ title: 'Threepenny Opera' }] })
        })
      })
    })
  })
})
