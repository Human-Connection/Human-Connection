import UpdateQuery from './UpdateQuery'

let $state
let component
let pageKey
let updateQuery
let previousResult
let fetchMoreResult

beforeEach(() => {
  component = {
    hasMore: true,
    pageSize: 1,
  }

  $state = {
    complete: jest.fn(),
    loaded: jest.fn(),
  }
  previousResult = { Post: [{ id: 1, foo: 'bar' }] }
  fetchMoreResult = { Post: [{ id: 2, foo: 'baz' }] }
  updateQuery = () => UpdateQuery(component, { $state, pageKey })
})

describe('UpdateQuery', () => {
  it('throws error because no key is given', () => {
    expect(() => {
      updateQuery()({ Post: [] }, { fetchMoreResult: { Post: [] } })
    }).toThrow(/No key given/)
  })

  describe('with a page key', () => {
    beforeEach(() => (pageKey = 'Post'))

    describe('given two arrays of things', () => {
      it('merges the arrays', () => {
        expect(updateQuery()(previousResult, { fetchMoreResult })).toEqual({
          Post: [
            { id: 1, foo: 'bar' },
            { id: 2, foo: 'baz' },
          ],
        })
      })

      it('does not create duplicates', () => {
        fetchMoreResult = { Post: [{ id: 1, foo: 'baz' }] }
        expect(updateQuery()(previousResult, { fetchMoreResult })).toEqual({
          Post: [{ id: 1, foo: 'bar' }],
        })
      })

      it('does not call $state.complete()', () => {
        expect(updateQuery()(previousResult, { fetchMoreResult }))
        expect($state.complete).not.toHaveBeenCalled()
      })

      describe('in case of fewer records than pageSize', () => {
        beforeEach(() => (component.pageSize = 10))
        it('calls $state.complete()', () => {
          expect(updateQuery()(previousResult, { fetchMoreResult }))
          expect($state.complete).toHaveBeenCalled()
        })

        it('changes component.hasMore to `false`', () => {
          expect(component.hasMore).toBe(true)
          expect(updateQuery()(previousResult, { fetchMoreResult }))
          expect(component.hasMore).toBe(false)
        })
      })
    })

    describe('given one array is undefined', () => {
      describe('does not crash', () => {
        it('neither if the previous data was undefined', () => {
          expect(updateQuery()(undefined, { fetchMoreResult })).toEqual({
            Post: [{ id: 2, foo: 'baz' }],
          })
        })

        it('not if the new data is undefined', () => {
          expect(updateQuery()(previousResult, {})).toEqual({ Post: [{ id: 1, foo: 'bar' }] })
        })
      })
    })
  })
})
