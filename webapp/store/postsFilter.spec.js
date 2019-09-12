import { getters, mutations } from './postsFilter.js'

let state
let testAction

describe('getters', () => {
  describe('isActive', () => {
    it('returns true if filter differs from default setting', () => {
      state = { filter: {} }
      expect(getters.isActive(state)).toEqual(false)
      state = { filter: { categories_some: { id_in: [24] } } }
      expect(getters.isActive(state)).toEqual(true)
    })
  })

  describe('filteredCategoryIds', () => {
    it('returns category ids if filter is set', () => {
      state = { filter: { categories_some: { id_in: [24] } } }
      expect(getters.filteredCategoryIds(state)).toEqual([24])
    })

    it('returns empty array if filter is not set', () => {
      state = { filter: { author: { followedBy_some: { id: 7 } } } }
      expect(getters.filteredCategoryIds(state)).toEqual([])
    })
  })

  describe('postsFilter', () => {
    it('returns filter', () => {
      state = { filter: { author: { followedBy_some: { id: 7 } } } }
      expect(getters.postsFilter(state)).toEqual({ author: { followedBy_some: { id: 7 } } })
    })
  })

  describe('filteredByUsersFollowed', () => {
    it('returns true if filter is set', () => {
      state = { filter: { author: { followedBy_some: { id: 7 } } } }
      expect(getters.filteredByUsersFollowed(state)).toBe(true)
    })

    it('returns false if filter is not set', () => {
      state = { filter: { categories_some: { id_in: [23] } } }
      expect(getters.filteredByUsersFollowed(state)).toBe(false)
    })
  })
})

describe('mutations', () => {
  describe('RESET_CATEGORIES', () => {
    beforeEach(() => {
      testAction = categoryId => {
        mutations.RESET_CATEGORIES(state, categoryId)
        return getters.postsFilter(state)
      }
    })
    it('resets the categories filter', () => {
      state = {
        filter: {
          author: { followedBy_some: { id: 7 } },
          categories_some: { id_in: [23] },
        },
      }
      expect(testAction(23)).toEqual({ author: { followedBy_some: { id: 7 } } })
    })
  })

  describe('TOGGLE_CATEGORY', () => {
    beforeEach(() => {
      testAction = categoryId => {
        mutations.TOGGLE_CATEGORY(state, categoryId)
        return getters.postsFilter(state)
      }
    })

    it('creates category filter if empty', () => {
      state = { filter: {} }
      expect(testAction(23)).toEqual({ categories_some: { id_in: [23] } })
    })

    it('adds category id not present', () => {
      state = { filter: { categories_some: { id_in: [24] } } }
      expect(testAction(23)).toEqual({ categories_some: { id_in: [24, 23] } })
    })

    it('removes category id if present', () => {
      state = { filter: { categories_some: { id_in: [23, 24] } } }
      const result = testAction(23)
      expect(result).toEqual({ categories_some: { id_in: [24] } })
    })

    it('removes category filter if empty', () => {
      state = { filter: { categories_some: { id_in: [23] } } }
      expect(testAction(23)).toEqual({})
    })

    it('does not get in the way of other filters', () => {
      state = {
        filter: {
          author: { followedBy_some: { id: 7 } },
          categories_some: { id_in: [23] },
        },
      }
      expect(testAction(23)).toEqual({ author: { followedBy_some: { id: 7 } } })
    })
  })

  describe('TOGGLE_FILTER_BY_FOLLOWED', () => {
    beforeEach(() => {
      testAction = userId => {
        mutations.TOGGLE_FILTER_BY_FOLLOWED(state, userId)
        return getters.postsFilter(state)
      }
    })

    describe('given empty filter', () => {
      beforeEach(() => {
        state = { filter: {} }
      })

      it('attaches the id of the current user to the filter object', () => {
        expect(testAction(4711)).toEqual({ author: { followedBy_some: { id: 4711 } } })
      })
    })

    describe('already filtered', () => {
      beforeEach(() => {
        state = { filter: { author: { followedBy_some: { id: 4711 } } } }
      })

      it('remove the id of the current user from the filter object', () => {
        expect(testAction(4711)).toEqual({})
      })
    })
  })
})
