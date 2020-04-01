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

    describe('given a type', () => {
      describe('of `following`', () => {
        it('uses the `following` data on :user', () => {
          const wrapper = Wrapper({ user, type: 'following' })
          wrapper.find('.base-button').trigger('click')

          expect(wrapper.vm.connections).toEqual(user.following)
          expect(wrapper.vm.allConnectionsCount).toBe(user.followingCount)
          expect(wrapper.emitted('fetchAllConnections')).toEqual([['following']])
        })
      })

      describe('of `followedBy`', () => {
        it('uses the `followedBy` data on :user', () => {
          const wrapper = Wrapper({ type: 'followedBy' })
          wrapper.find('.base-button').trigger('click')

          expect(wrapper.vm.connections).toEqual(user.followedBy)
          expect(wrapper.vm.allConnectionsCount).toBe(user.followedByCount)
          expect(wrapper.emitted('fetchAllConnections')).toEqual([['followedBy']])
        })
      })
    })

    describe('given no type', () => {
      it('defaults type to `following`', () => {
        const wrapper = Wrapper()
        expect(wrapper.vm.type).toBe('following')
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
        let wrapper
        beforeAll(() => {
          wrapper = Wrapper()
        })

        it(`renders the connections`, () => {
          expect(wrapper.findAll('.user-teaser').length).toEqual(user.following.length)
        })

        it(`has a button to load all remaining connections`, async () => {
          wrapper.find('.base-button').trigger('click')
          expect(wrapper.emitted('fetchAllConnections')).toBeTruthy()
        })
      })

      describe('with more than 7 loaded connections', () => {
        let wrapper
        beforeAll(() => {
          wrapper = Wrapper({ user: allConnectionsUser })
        })

        it('renders the connections', () => {
          expect(wrapper.findAll('.user-teaser')).toHaveLength(allConnectionsUser.followingCount)
        })

        it('renders the user-teasers in an overflow-container', () => {
          expect(wrapper.find('.--overflow').is('div')).toBe(true)
        })

        it('renders a filter text input', () => {
          expect(wrapper.find('[name="followingFilter"]').is('input')).toBe(true)
        })
      })
    })
  })
})
