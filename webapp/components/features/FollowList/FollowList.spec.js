import { config, mount } from '@vue/test-utils'
import Vuex from 'vuex'
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
    propsData = { user }
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
            expect(wrapper.findAll('.user-teaser').length).toEqual(user[type].length)
          })

          it(`has a button to load all remaining users ${type}`, async () => {
            jest.useFakeTimers()

            wrapper.find('button').trigger('click')
            await jest.runAllTicks()
            await wrapper.vm.$nextTick()

            expect(wrapper.vm.connections.length).toBe(user[`${type}Count`])
            expect(queryMock).toHaveBeenCalledWith({
              query: wrapper.vm.queries[type],
              variables: { id: user.id },
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
            expect(wrapper.find('.no-connections-message').text()).toBe(
              `${user.name} ${wrapper.vm.$t(`profile.network.${type}Nobody`)}`,
            )
          })
        }),
      )
    })
  })
})

const user = {
  name: 'Jenny Rostock',
  id: 'u3',
  followedByCount: 12,
  followingCount: 15,
  followedBy: [
    {
      id: '2877b626-bac0-43df-b2bf-4ee025ba38b2',
      name: 'Kristina Beahan',
      slug: 'kristina-beahan',
    },
    {
      id: '16b8838d-cc9f-4d30-8601-e4dea77d2f02',
      name: 'Rhonda Stokes',
      slug: 'rhonda-stokes',
    },
    {
      id: '47a9846a-87d4-43fa-bf81-51d21dc38ed3',
      name: 'Benny Lang',
      slug: 'benny-lang',
    },
    {
      id: 'd3d43b17-e7bb-4778-a373-798df58a9a5f',
      name: 'Ms. Rita Thompson',
      slug: 'ms-rita-thompson',
    },
    {
      id: '18a4827c-8b5f-4510-b6fe-09fe8688eed1',
      name: 'Arthur Johns',
      slug: 'arthur-johns',
    },
    {
      id: '45313bea-9152-4c8d-9c6e-1eca029979f8',
      name: 'Jeremiah Breitenberg',
      slug: 'jeremiah-breitenberg',
    },
    {
      id: 'cfaf1c25-f0ad-4bdf-82a3-e4d8d5e5093e',
      name: 'Dominic Weimann Jr.',
      slug: 'dominic-weimann-jr',
    },
  ],
  following: [
    {
      id: '16b8838d-cc9f-4d30-8601-e4dea77d2f02',
      name: 'Rhonda Stokes',
      slug: 'rhonda-stokes',
    },
    {
      id: '47a9846a-87d4-43fa-bf81-51d21dc38ed3',
      name: 'Benny Lang',
      slug: 'benny-lang',
    },
    {
      id: '18a4827c-8b5f-4510-b6fe-09fe8688eed1',
      name: 'Arthur Johns',
      slug: 'arthur-johns',
    },
    {
      id: 'cfaf1c25-f0ad-4bdf-82a3-e4d8d5e5093e',
      name: 'Dominic Weimann Jr.',
      slug: 'dominic-weimann-jr',
    },
    {
      id: '69dbad2b-5749-4697-9976-221992439086',
      name: 'Ashley Fisher',
      slug: 'ashley-fisher',
    },
    {
      id: 'a09a2341-0575-4235-96c6-2ebc7d77de3f',
      name: 'Phil Dare',
      slug: 'phil-dare',
    },
    {
      id: '2877b626-bac0-43df-b2bf-4ee025ba38b2',
      name: 'Kristina Beahan',
      slug: 'kristina-beahan',
    },
  ],
}

const additionalConnections = {
  followedBy: [
    {
      id: '9f305e7a-ae5a-4e22-8269-8b6899af674f',
      name: 'Hugh Harris Sr.',
      slug: 'hugh-harris-sr',
    },
    {
      id: '69dbad2b-5749-4697-9976-221992439086',
      name: 'Ashley Fisher',
      slug: 'ashley-fisher',
    },
    {
      id: 'eec8ee9e-ee4e-4b83-b655-a106eb857611',
      name: 'Devin Reynolds',
      slug: 'devin-reynolds',
    },
    {
      id: 'f638fad4-73c2-4bc9-ae4e-2e53035397e9',
      name: 'Sophia Jaskolski',
      slug: 'sophia-jaskolski',
    },
    {
      id: '61040fdf-da6a-489e-b79c-45f58d33386f',
      name: 'Rodolfo Lind',
      slug: 'rodolfo-lind',
    },
  ],

  following: [
    {
      id: '9011b4fd-feec-4b74-b6d0-e0a41b6658e6',
      name: 'Lela Kautzer',
      slug: 'lela-kautzer',
    },
    {
      id: '61040fdf-da6a-489e-b79c-45f58d33386f',
      name: 'Rodolfo Lind',
      slug: 'rodolfo-lind',
    },
    {
      id: '3a089655-19c8-478f-97c1-345b3dfc95a3',
      name: 'Lee Erdman',
      slug: 'lee-erdman',
    },
    {
      id: 'c5f7eea9-ee4b-4384-91cd-b6c7d128f122',
      name: 'Omar Turcotte',
      slug: 'omar-turcotte',
    },
    {
      id: 'f638fad4-73c2-4bc9-ae4e-2e53035397e9',
      name: 'Sophia Jaskolski',
      slug: 'sophia-jaskolski',
    },
    {
      id: 'u4',
      name: 'Huey',
      slug: 'huey',
    },
    {
      id: '6de37964-e79b-4be4-b384-ed571c37a31e',
      name: 'Mr. Oliver Quitzon',
      slug: 'mr-oliver-quitzon',
    },
    {
      id: 'd3d43b17-e7bb-4778-a373-798df58a9a5f',
      name: 'Ms. Rita Thompson',
      slug: 'ms-rita-thompson',
    },
  ],
}
