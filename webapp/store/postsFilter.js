import get from 'lodash/get'
import update from 'lodash/update'
import xor from 'lodash/xor'
import isEmpty from 'lodash/isEmpty'
import isEqual from 'lodash/isEqual'
import clone from 'lodash/clone'

const defaultFilter = {}

export const state = () => {
  return {
    filter: {
      OR: [{ pinnedBy_in: { role_in: ['admin'] } }, {}],
    },
  }
}

export const mutations = {
  TOGGLE_FILTER_BY_FOLLOWED(state, currentUserId) {
    let filter = clone(state.filter)
    const id = filter.OR.find(object => object.author)
    if (id) {
      filter.OR.forEach(object => delete object.author)
      state.filter = filter
    } else {
      if (isEmpty(filter.OR[-1])) filter.OR.pop()
      filter.OR.map(object => {
        for (let key in object) {
          if (object.hasOwnProperty(key)) {
            object = { key: object[key] }
          }
        }
      })
      filter.OR.unshift({
        author: { followedBy_some: { id: currentUserId } },
      })
      state.filter = filter
    }
  },
  RESET_CATEGORIES(state) {
    const filter = clone(state.filter)
    delete filter.categories_some
    state.filter = filter
  },
  TOGGLE_CATEGORY(state, categoryId) {
    let filter = clone(state.filter)
    if (isEmpty(filter.OR[-1])) filter.OR.pop()
    filter.OR.map(object => {
      for (let key in object) {
        if (object.hasOwnProperty(key)) {
          object = { key: object[key] }
        }
      }
    })
    filter.OR.unshift({
      categories_some: { id_in: [categoryId] },
    })
    // update(filter, 'categories_some.id_in', categoryIds => xor(categoryIds, [categoryId]))
    // if (isEmpty(get(filter.OR[0], 'categories_some.id_in'))) delete filter.OR[0].categories_some
    state.filter = filter
  },
  TOGGLE_EMOTION(state, emotion) {
    const filter = clone(state.filter)
    update(filter, 'emotions_some.emotion_in', emotions => xor(emotions, [emotion]))
    if (isEmpty(get(filter, 'emotions_some.emotion_in'))) delete filter.emotions_some
    state.filter = filter
  },
}

export const getters = {
  isActive(state) {
    return !isEqual(state.filter, defaultFilter)
  },
  postsFilter(state) {
    return state.filter
  },
  filteredCategoryIds(state) {
    return get(state.filter, 'categories_some.id_in') || []
  },
  filteredByUsersFollowed(state) {
    return !!get(state.filter, 'author.followedBy_some.id')
  },
  filteredByEmotions(state) {
    return get(state.filter, 'emotions_some.emotion_in') || []
  },
}
