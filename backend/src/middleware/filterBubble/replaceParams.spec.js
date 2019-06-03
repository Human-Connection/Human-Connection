import replaceParams from './replaceParams.js'

describe('replaceParams', () => {
  let args
  let context
  let run

  let action = () => {
    return replaceParams(args, context)
  }

  beforeEach(() => {
    args = {}
    run = jest.fn().mockResolvedValue({
      records: [{ get: () => 1 }, { get: () => 2 }, { get: () => 3 }],
    })
    context = {
      user: { id: 'u4711' },
      driver: {
        session: () => {
          return {
            run,
            close: () => {},
          }
        },
      },
    }
  })

  describe('given any additional filter args', () => {
    describe('merges', () => {
      it('empty filter object', async () => {
        args = { filter: {}, filterBubble: { author: 'followed' } }
        const expected = { filter: { author: { id_in: [1, 2, 3] } } }
        await expect(action()).resolves.toEqual(expected)
      })

      it('filter.title', async () => {
        args = { filter: { title: 'bla' }, filterBubble: { author: 'followed' } }
        const expected = { filter: { title: 'bla', author: { id_in: [1, 2, 3] } } }
        await expect(action()).resolves.toEqual(expected)
      })

      it('filter.author', async () => {
        args = { filter: { author: { name: 'bla' } }, filterBubble: { author: 'followed' } }
        const expected = { filter: { author: { name: 'bla', id_in: [1, 2, 3] } } }
        await expect(action()).resolves.toEqual(expected)
      })
    })
  })

  describe('args == ', () => {
    describe('{}', () => {
      it('does not crash', async () => {
        await expect(action()).resolves.toEqual({})
      })
    })

    describe('{ filterBubble: { author: followed } }', () => {
      beforeEach(() => {
        args = { filterBubble: { author: 'followed' } }
      })

      it('returns args object with resolved ids of followed users', async () => {
        const expected = { filter: { author: { id_in: [1, 2, 3] } } }
        await expect(action()).resolves.toEqual(expected)
      })

      it('makes database calls', async () => {
        await action()
        expect(run).toHaveBeenCalled()
      })
    })

    describe('{ filterBubble: { } }', () => {
      it('removes filterBubble param', async () => {
        const expected = {}
        await expect(action()).resolves.toEqual(expected)
      })

      it('does not make database calls', async () => {
        await action()
        expect(run).not.toHaveBeenCalled()
      })
    })

    describe('{ filterBubble: { author: all } }', () => {
      it('removes filterBubble param', async () => {
        const expected = {}
        await expect(action()).resolves.toEqual(expected)
      })

      it('does not make database calls', async () => {
        await action()
        expect(run).not.toHaveBeenCalled()
      })
    })
  })
})
