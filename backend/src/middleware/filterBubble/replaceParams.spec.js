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

  describe('args == ', () => {
    describe('{}', () => {
      it('does not crash', async () => {
        await expect(action()).resolves.toEqual({})
      })
    })

    describe('unauthenticated user', () => {
      beforeEach(() => {
        context.user = null
      })

      describe('{ filterBubble: { author: following } }', () => {
        it('throws error', async () => {
          args = { filterBubble: { author: 'following' } }
          await expect(action()).rejects.toThrow('You are unauthenticated')
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

    describe('authenticated user', () => {
      beforeEach(() => {
        context.user = { id: 'u4711' }
      })

      describe('{ filterBubble: { author: following } }', () => {
        beforeEach(() => {
          args = { filterBubble: { author: 'following' } }
        })

        it('returns args object with resolved ids of followed users', async () => {
          const expected = { filter: { author: { id_in: [1, 2, 3] } } }
          await expect(action()).resolves.toEqual(expected)
        })

        it('makes database calls', async () => {
          await action()
          expect(run).toHaveBeenCalled()
        })

        describe('given any additional filter args', () => {
          describe('merges', () => {
            it('empty filter object', async () => {
              args.filter = {}
              const expected = { filter: { author: { id_in: [1, 2, 3] } } }
              await expect(action()).resolves.toEqual(expected)
            })

            it('filter.title', async () => {
              args.filter = { title: 'bla' }
              const expected = { filter: { title: 'bla', author: { id_in: [1, 2, 3] } } }
              await expect(action()).resolves.toEqual(expected)
            })

            it('filter.author', async () => {
              args.filter = { author: { name: 'bla' } }
              const expected = { filter: { author: { name: 'bla', id_in: [1, 2, 3] } } }
              await expect(action()).resolves.toEqual(expected)
            })
          })
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
})
