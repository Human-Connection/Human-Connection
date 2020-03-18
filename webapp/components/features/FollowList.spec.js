import { config, mount } from '@vue/test-utils'
import Vuex from 'vuex'
import FollowList from './FollowList.vue'

const localVue = global.localVue

config.stubs['client-only'] = '<span><slot /></span>'
config.stubs['ds-space'] = '<span><slot /></span>'
config.stubs['nuxt-link'] = '<span><slot /></span>'

let user, additionalConnections

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
      ;['following', 'followedBy'].forEach(type =>
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
            wrapper.find('button').trigger('click')
            await wrapper.vm.$nextTick()
            expect(queryMock).toHaveBeenCalledWith({
              query: wrapper.vm.queries[type],
              variables: { id: user.id },
            })
            expect(wrapper.vm.connections.length).toBe(user[`${type}Count`])
          })
        }),
      )
    })
  })
})

user = {
  name: 'Jenny Rostock',
  id: 'u3',
  followedByCount: 32,
  followingCount: 31,
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

additionalConnections = {
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
    {
      id: 'a09a2341-0575-4235-96c6-2ebc7d77de3f',
      name: 'Phil Dare',
      slug: 'phil-dare',
    },
    {
      id: 'c5f7eea9-ee4b-4384-91cd-b6c7d128f122',
      name: 'Omar Turcotte',
      slug: 'omar-turcotte',
    },
    {
      id: '036cae06-5c8f-4ffb-923e-73b2baba1a00',
      name: 'Rosemary Wiegand',
      slug: 'rosemary-wiegand',
    },
    {
      id: '9011b4fd-feec-4b74-b6d0-e0a41b6658e6',
      name: 'Lela Kautzer',
      slug: 'lela-kautzer',
    },
    {
      id: '019a48f6-5785-4c5c-a2ac-7cb80007aa41',
      name: 'Roosevelt Lindgren III',
      slug: 'roosevelt-lindgren-iii',
    },
    {
      id: '3a089655-19c8-478f-97c1-345b3dfc95a3',
      name: 'Lee Erdman',
      slug: 'lee-erdman',
    },
    {
      id: '8af5df96-8c09-4fe4-a9cd-572840c94529',
      name: 'Mamie Conn',
      slug: 'mamie-conn',
    },
    {
      id: 'ca1b7bcb-1254-43ff-90a1-b0e6d49c31bc',
      name: 'Sergio Casper',
      slug: 'sergio-casper',
    },
    {
      id: '4c11e030-0419-43a0-8d7a-dc198b57efd7',
      name: 'Charles Ruecker',
      slug: 'charles-ruecker',
    },
    {
      id: '25983fa2-a861-46f3-9c71-124286de7367',
      name: 'Caroline Pollich',
      slug: 'caroline-pollich',
    },
    {
      id: '687a0fcb-531d-42c1-8854-a47dc59f61e7',
      name: 'Dr. Darryl Rath',
      slug: 'dr-darryl-rath',
    },
    {
      id: 'd0ecaa07-0ba1-4deb-ac6f-1dc01cdd6174',
      name: 'Isaac Purdy MD',
      slug: 'isaac-purdy-md',
    },
    {
      id: 'c0846aa5-7f3e-44d9-89db-bef675cac431',
      name: 'Nichole Schamberger',
      slug: 'nichole-schamberger',
    },
    {
      id: 'u6',
      name: 'Louie',
      slug: 'louie',
    },
    {
      id: 'u1',
      name: 'Peter Lustig',
      slug: 'peter-lustig',
    },
    {
      id: '6de37964-e79b-4be4-b384-ed571c37a31e',
      name: 'Mr. Oliver Quitzon',
      slug: 'mr-oliver-quitzon',
    },
    {
      id: '96446bee-ce95-47d6-acc1-742c70d21518',
      name: 'Myrtle Williamson',
      slug: 'myrtle-williamson',
    },
    {
      id: '9e58bc8d-d63a-4b03-92df-fb540ff8b2ce',
      name: 'Andy Stracke',
      slug: 'andy-stracke',
    },
    {
      id: 'd808b58b-b097-4614-a2c5-81187e9884ca',
      name: 'Warren Crist',
      slug: 'warren-crist',
    },
    {
      id: 'ff800e3a-ceba-44e9-904b-458c20e518ff',
      name: 'Dolores Wilkinson V',
      slug: 'dolores-wilkinson-v',
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
    {
      id: '036cae06-5c8f-4ffb-923e-73b2baba1a00',
      name: 'Rosemary Wiegand',
      slug: 'rosemary-wiegand',
    },
    {
      id: 'eec8ee9e-ee4e-4b83-b655-a106eb857611',
      name: 'Devin Reynolds',
      slug: 'devin-reynolds',
    },
    {
      id: '96446bee-ce95-47d6-acc1-742c70d21518',
      name: 'Myrtle Williamson',
      slug: 'myrtle-williamson',
    },
    {
      id: '9f305e7a-ae5a-4e22-8269-8b6899af674f',
      name: 'Hugh Harris Sr.',
      slug: 'hugh-harris-sr',
    },
    {
      id: 'c0846aa5-7f3e-44d9-89db-bef675cac431',
      name: 'Nichole Schamberger',
      slug: 'nichole-schamberger',
    },
    {
      id: '019a48f6-5785-4c5c-a2ac-7cb80007aa41',
      name: 'Roosevelt Lindgren III',
      slug: 'roosevelt-lindgren-iii',
    },
    {
      id: 'ff800e3a-ceba-44e9-904b-458c20e518ff',
      name: 'Dolores Wilkinson V',
      slug: 'dolores-wilkinson-v',
    },
    {
      id: '9e58bc8d-d63a-4b03-92df-fb540ff8b2ce',
      name: 'Andy Stracke',
      slug: 'andy-stracke',
    },
    {
      id: 'd808b58b-b097-4614-a2c5-81187e9884ca',
      name: 'Warren Crist',
      slug: 'warren-crist',
    },
    {
      id: '45313bea-9152-4c8d-9c6e-1eca029979f8',
      name: 'Jeremiah Breitenberg',
      slug: 'jeremiah-breitenberg',
    },
    {
      id: '8af5df96-8c09-4fe4-a9cd-572840c94529',
      name: 'Mamie Conn',
      slug: 'mamie-conn',
    },
    {
      id: '4c11e030-0419-43a0-8d7a-dc198b57efd7',
      name: 'Charles Ruecker',
      slug: 'charles-ruecker',
    },
    {
      id: '687a0fcb-531d-42c1-8854-a47dc59f61e7',
      name: 'Dr. Darryl Rath',
      slug: 'dr-darryl-rath',
    },
    {
      id: 'ca1b7bcb-1254-43ff-90a1-b0e6d49c31bc',
      name: 'Sergio Casper',
      slug: 'sergio-casper',
    },
    {
      id: '25983fa2-a861-46f3-9c71-124286de7367',
      name: 'Caroline Pollich',
      slug: 'caroline-pollich',
    },
    {
      id: 'd0ecaa07-0ba1-4deb-ac6f-1dc01cdd6174',
      name: 'Isaac Purdy MD',
      slug: 'isaac-purdy-md',
    },
  ],
}
