import { config, mount } from '@vue/test-utils'
import Vuex from 'vuex'

import helpers from '~/storybook/helpers'
import FollowList from './FollowList.vue'

const localVue = global.localVue

config.stubs['client-only'] = '<span><slot /></span>'
config.stubs['ds-space'] = '<span><slot /></span>'
config.stubs['nuxt-link'] = '<span><slot /></span>'

const user = {
  ...helpers.fakeUser()[0],
  followedByCount: 12,
  followingCount: 15,
  followedBy: helpers.fakeUser(7),
  following: helpers.fakeUser(7),
}

const allConnectionsUser = {
  ...user,
  followedBy: [
    ...user.followedBy,
    ...helpers.fakeUser(user.followedByCount - user.followedBy.length),
  ],
  following: [...user.following, ...helpers.fakeUser(user.followingCount - user.following.length)],
}

const noConnectionsUser = {
  ...user,
  followedByCount: 0,
  followingCount: 0,
  followedBy: [],
  following: [],
}

describe('FollowList.vue', () => {
  let store, getters
  const Wrapper = (customProps) =>
    mount(FollowList, {
      store,
      propsData: { user, ...customProps },
      mocks: {
        $t: jest.fn((str) => str),
      },
      localVue,
    })

  beforeAll(() => {
    getters = {
      'auth/user': () => {
        return {}
      },
      'auth/isModerator': () => false,
    }
  })

  describe('mount', () => {
    beforeAll(() => {
      store = new Vuex.Store({
        getters,
      })
    })

    describe('given a user', () => {
      describe('without connections', () => {
        it('displays the followingNobody message', () => {
          const wrapper = Wrapper({ user: noConnectionsUser })
          expect(wrapper.find('.nobody-message').text()).toBe(
            `${noConnectionsUser.name} ${wrapper.vm.$t(`profile.network.followingNobody`)}`,
          )
        })

        it('displays the followedByNobody message', () => {
          const wrapper = Wrapper({ user: noConnectionsUser, type: 'followedBy' })
          expect(wrapper.find('.nobody-message').text()).toBe(
            `${noConnectionsUser.name} ${wrapper.vm.$t(`profile.network.followedByNobody`)}`,
          )
        })
      })

      describe('with up to 7 loaded connections', () => {
        let followingWrapper
        let followedByWrapper
        beforeAll(() => {
          followingWrapper = Wrapper()
          followedByWrapper = Wrapper({ type: 'followedBy' })
        })

        it(`renders the connections`, () => {
          expect(followedByWrapper.findAll('.user-teaser').length).toEqual(user.followedBy.length)
          expect(followingWrapper.findAll('.user-teaser').length).toEqual(user.following.length)
        })

        it(`has a button to load all remaining connections`, async () => {
          followingWrapper.find('.base-button').trigger('click')
          followedByWrapper.find('.base-button').trigger('click')
          expect(followingWrapper.emitted('fetchAllConnections')).toBeTruthy()
          expect(followedByWrapper.emitted('fetchAllConnections')).toBeTruthy()
        })
      })

      describe('with more than 7 loaded connections', () => {
        let followingWrapper
        let followedByWrapper
        beforeAll(() => {
          followingWrapper = Wrapper({ user: allConnectionsUser })
          followedByWrapper = Wrapper({ user: allConnectionsUser, type: 'followedBy' })
        })

        it('renders the connections', () => {
          expect(followedByWrapper.findAll('.user-teaser')).toHaveLength(
            allConnectionsUser.followedByCount,
          )
          expect(followingWrapper.findAll('.user-teaser')).toHaveLength(
            allConnectionsUser.followingCount,
          )
        })

        it('renders the user-teasers in an overflow-container', () => {
          expect(followingWrapper.find('.--overflow').is('div')).toBe(true)
          expect(followedByWrapper.find('.--overflow').is('div')).toBe(true)
        })

        it('renders a filter text input', () => {
          expect(followingWrapper.find('[name="followingFilter"]').is('input')).toBe(true)
          expect(followedByWrapper.find('[name="followedByFilter"]').is('input')).toBe(true)
        })
      })
    })
  })
})
