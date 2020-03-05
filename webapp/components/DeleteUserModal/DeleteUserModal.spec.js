import { config, shallowMount, mount } from '@vue/test-utils'

import ConfirmModal from './DeleteUserModal.vue'

const localVue = global.localVue

describe('DisableModal.vue', () => {
    let mocks
    let propsData
    let wrapper

    beforeEach(() => {
        propsData = {
            slug: "oger-ly",
            id: "u1",
            name: "Oger Ly",
            avatar: "avatar-link",
            contributionsCount: "42",
            commentedCount: "24",
            createdAt: "date-created-at",
        }
        mocks = {
          $t: jest.fn(),
          $filters: {
            truncate: a => a,
          },
        }
      })
})