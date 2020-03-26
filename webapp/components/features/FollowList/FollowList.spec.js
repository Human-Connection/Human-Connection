import { config, mount } from '@vue/test-utils'
import Vuex from 'vuex'

import helpers from '~/storybook/helpers'
import FollowList from './FollowList.vue'

const localVue = global.localVue

config.stubs['client-only'] = '<span><slot /></span>'
config.stubs['ds-space'] = '<span><slot /></span>'
config.stubs['nuxt-link'] = '<span><slot /></span>'

describe('FollowList.vue', () => {
  let store, mocks, getters, propsData

  beforeAll(() => {
    mocks = {
      $t: jest.fn(),
    }
    getters = {
      'auth/user': () => {
        return {}
      },
      'auth/isModerator': () => false,
    }
    const [_user] = helpers.fakeUser()
    propsData = {
      user: {
        ..._user,
        followedByCount: 12,
        followingCount: 15,
        followedBy: helpers.fakeUser(7),
        following: helpers.fakeUser(7),
      },
    }
  })

  describe('mount', () => {
    beforeAll(() => {
      store = new Vuex.Store({
        getters,
      })
    })

    describe('given a user with connections', () => {
      ;['following', 'followedBy'].forEach((type) =>
        describe(`and type=${type}`, () => {
          let wrapper
          let queryMock

          beforeAll(() => {
            queryMock = jest.fn().mockResolvedValue({
              data: { User: [{ [type]: additionalConnections[type] }] },
            })

            wrapper = mount(FollowList, {
              store,
              propsData: { ...propsData, type: type },
              mocks: {
                ...mocks,
                $apollo: {
                  query: queryMock,
                },
              },
              localVue,
            })
          })

          it(`shows the users ${type}`, () => {
            expect(wrapper.findAll('.user-teaser').length).toEqual(propsData.user[type].length)
          })

          it(`has a button to load all remaining users ${type}`, async () => {
            jest.useFakeTimers()

            wrapper.find('button').trigger('click')
            await jest.runAllTicks()
            await wrapper.vm.$nextTick()

            expect(wrapper.vm.connections.length).toBe(propsData.user[`${type}Count`])
            expect(queryMock).toHaveBeenCalledWith({
              query: wrapper.vm.queries[type],
              variables: { id: propsData.user.id },
            })
          })
        }),
      )
    })

    describe('given a user without connections', () => {
      ;['following', 'followedBy'].forEach((type) =>
        describe(`and type=${type}`, () => {
          let wrapper

          beforeAll(() => {
            wrapper = mount(FollowList, {
              store,
              mocks: {
                $t: jest.fn().mockReturnValue('has no connections'),
              },
              localVue,
              propsData: {
                user: {
                  ...propsData.user,
                  followedByCount: 0,
                  followingCount: 0,
                  followedBy: [],
                  following: [],
                },
                type,
              },
            })
          })

          it('displays ne no-follower message', () => {
            expect(wrapper.find('.no-connections').text()).toBe(
              `${propsData.user.name} ${wrapper.vm.$t()}`,
            )
          })
        }),
      )
    })
  })
})

const additionalConnections = {
  followedBy: helpers.fakeUser(5),
  following: helpers.fakeUser(8),
}
