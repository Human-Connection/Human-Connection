import { getters, mutations } from './posts.js'

let state
let testMutation

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

    it('returns empty array if category filter is not set', () => {
      state = { filter: { author: { followedBy_some: { id: 7 } } } }
      expect(getters.filteredCategoryIds(state)).toEqual([])
    })
  })

  describe('filteredLanguageCodes', () => {
    it('returns category ids if filter is set', () => {
      state = { filter: { language_in: ['en', 'de', 'pt'] } }
      expect(getters.filteredLanguageCodes(state)).toEqual(['en', 'de', 'pt'])
    })

    it('returns empty array if language filter is not set', () => {
      state = { filter: { author: { followedBy_some: { id: 7 } } } }
      expect(getters.filteredLanguageCodes(state)).toEqual([])
    })
  })

  describe('filter', () => {
    it('returns filter', () => {
      state = { filter: { author: { followedBy_some: { id: 7 } } } }
      expect(getters.filter(state)).toEqual({ author: { followedBy_some: { id: 7 } } })
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

  describe('filteredByEmotions', () => {
    it('returns an emotions array if filter is set', () => {
      state = { filter: { emotions_some: { emotion_in: ['sad'] } } }
      expect(getters.filteredByEmotions(state)).toEqual(['sad'])
    })

    it('returns an emotions array even when other filters are set', () => {
      state = {
        filter: { emotions_some: { emotion_in: ['sad'] }, categories_some: { id_in: [23] } },
      }
      expect(getters.filteredByEmotions(state)).toEqual(['sad'])
    })

    it('returns empty array if filter is not set', () => {
      state = { filter: {} }
      expect(getters.filteredByEmotions(state)).toEqual([])
    })

    it('returns empty array if another filter is set, but not emotions', () => {
      state = { filter: { categories_some: { id_in: [23] } } }
      expect(getters.filteredByEmotions(state)).toEqual([])
    })
  })

  describe('orderByOptions', () => {
    it('returns all options regardless of current state', () => {
      const $t = jest.fn(t => t)
      expect(getters.orderOptions()({ $t })).toEqual([
        {
          key: 'store.posts.orderBy.oldest.label',
          label: 'store.posts.orderBy.oldest.label',
          icon: 'sort-amount-asc',
          value: 'createdAt_asc',
        },
        {
          key: 'store.posts.orderBy.newest.label',
          label: 'store.posts.orderBy.newest.label',
          icon: 'sort-amount-desc',
          value: 'createdAt_desc',
        },
      ])
    })
  })

  describe('orderBy', () => {
    it('returns value for graphql query', () => {
      state = {
        order: {
          key: 'store.posts.orderBy.newest.label',
          label: 'store.posts.orderBy.newest.label',
          icon: 'sort-amount-desc',
          value: 'createdAt_desc',
        },
      }
      expect(getters.orderBy(state)).toEqual('createdAt_desc')
    })
  })
})

describe('mutations', () => {
  describe('RESET_LANGUAGES', () => {
    it('resets the languages filter', () => {
      state = {
        filter: {
          author: { followedBy_some: { id: 7 } },
          language_in: ['nl'],
        },
      }
      mutations.RESET_LANGUAGES(state)
      expect(getters.filter(state)).toEqual({ author: { followedBy_some: { id: 7 } } })
    })
  })

  describe('RESET_CATEGORIES', () => {
    beforeEach(() => {
      testMutation = categoryId => {
        mutations.RESET_CATEGORIES(state, categoryId)
        return getters.filter(state)
      }
    })
    it('resets the categories filter', () => {
      state = {
        filter: {
          author: { followedBy_some: { id: 7 } },
          categories_some: { id_in: [23] },
        },
      }
      expect(testMutation(23)).toEqual({ author: { followedBy_some: { id: 7 } } })
    })
  })

  describe('TOGGLE_LANGUAGE', () => {
    beforeEach(() => {
      testMutation = languageCode => {
        mutations.TOGGLE_LANGUAGE(state, languageCode)
        return getters.filter(state)
      }
    })

    it('creates category filter if empty', () => {
      state = { filter: {} }
      expect(testMutation('de')).toEqual({ language_in: ['de'] })
    })

    it('adds language code to existing filter', () => {
      state = { filter: { language_in: ['de'] } }
      expect(testMutation('en')).toEqual({ language_in: ['de', 'en'] })
    })

    it('removes category id if present', () => {
      state = { filter: { language_in: ['de', 'en'] } }
      expect(testMutation('de')).toEqual({ language_in: ['en'] })
    })

    it('removes language filter if empty', () => {
      state = { filter: { language_in: ['de'] } }
      expect(testMutation('de')).toEqual({})
    })

    it('does not get in the way of other filters', () => {
      state = {
        filter: {
          author: { followedBy_some: { id: 7 } },
          language_in: ['de'],
        },
      }
      expect(testMutation('de')).toEqual({ author: { followedBy_some: { id: 7 } } })
    })
  })

  describe('TOGGLE_CATEGORY', () => {
    beforeEach(() => {
      testMutation = categoryId => {
        mutations.TOGGLE_CATEGORY(state, categoryId)
        return getters.filter(state)
      }
    })

    it('creates category filter if empty', () => {
      state = { filter: {} }
      expect(testMutation(23)).toEqual({ categories_some: { id_in: [23] } })
    })

    it('adds category id not present', () => {
      state = { filter: { categories_some: { id_in: [24] } } }
      expect(testMutation(23)).toEqual({ categories_some: { id_in: [24, 23] } })
    })

    it('removes category id if present', () => {
      state = { filter: { categories_some: { id_in: [23, 24] } } }
      const result = testMutation(23)
      expect(result).toEqual({ categories_some: { id_in: [24] } })
    })

    it('removes category filter if empty', () => {
      state = { filter: { categories_some: { id_in: [23] } } }
      expect(testMutation(23)).toEqual({})
    })

    it('does not get in the way of other filters', () => {
      state = {
        filter: {
          author: { followedBy_some: { id: 7 } },
          categories_some: { id_in: [23] },
        },
      }
      expect(testMutation(23)).toEqual({ author: { followedBy_some: { id: 7 } } })
    })
  })

  describe('TOGGLE_FILTER_BY_FOLLOWED', () => {
    beforeEach(() => {
      testMutation = userId => {
        mutations.TOGGLE_FILTER_BY_FOLLOWED(state, userId)
        return getters.filter(state)
      }
    })

    describe('given empty filter', () => {
      beforeEach(() => {
        state = { filter: {} }
      })

      it('attaches the id of the current user to the filter object', () => {
        expect(testMutation(4711)).toEqual({ author: { followedBy_some: { id: 4711 } } })
      })
    })

    describe('already filtered', () => {
      beforeEach(() => {
        state = { filter: { author: { followedBy_some: { id: 4711 } } } }
      })

      it('remove the id of the current user from the filter object', () => {
        expect(testMutation(4711)).toEqual({})
      })
    })
  })

  describe('SELECT_ORDER', () => {
    beforeEach(() => {
      testMutation = key => {
        mutations.SELECT_ORDER(state, key)
        return getters.orderBy(state)
      }
    })
    it('switches the currently selected order', () => {
      state = {
        // does not matter
      }
      expect(testMutation('createdAt_asc')).toEqual('createdAt_asc')
    })
  })
})
