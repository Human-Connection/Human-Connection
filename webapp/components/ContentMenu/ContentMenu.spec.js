import { config, mount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import VTooltip from 'v-tooltip'
import Styleguide from '@human-connection/styleguide'
import ContentMenu from './ContentMenu.vue'

const localVue = createLocalVue()

localVue.use(Styleguide)
localVue.use(VTooltip)
localVue.use(Vuex)

config.stubs['router-link'] = '<span><slot /></span>'

let getters, mutations, mocks, menuToggle, openModalSpy

describe('ContentMenu.vue', () => {
  beforeEach(() => {
    mocks = {
      $t: jest.fn(str => str),
      $i18n: {
        locale: () => 'en',
      },
      $router: {
        resolve: jest.fn(obj => {
          obj.href = '/post/edit/d23a4265-f5f7-4e17-9f86-85f714b4b9f8'
          return obj
        }),
        push: jest.fn(),
      },
    }
  })

  describe('mount', () => {
    mutations = {
      'modal/SET_OPEN': () => jest.fn(),
    }
    getters = {
      'auth/isModerator': () => false,
      'auth/isAdmin': () => false,
    }

    const openContentMenu = (values = {}) => {
      const store = new Vuex.Store({ mutations, getters })
      const wrapper = mount(ContentMenu, {
        propsData: {
          ...values,
        },
        mocks,
        store,
        localVue,
      })
      menuToggle = wrapper.find('.content-menu-trigger')
      menuToggle.trigger('click')
      return wrapper
    }

    describe('contribution', () => {
      it('owner can edit and delete contribution', () => {
        const wrapper = openContentMenu({
          isOwner: true,
          resourceType: 'contribution',
          resource: {
            id: 'd23a4265-f5f7-4e17-9f86-85f714b4b9f8',
          },
        })
        let items = wrapper.findAll('.ds-menu-item')
        openModalSpy = jest.spyOn(wrapper.vm, 'openModal')
        expect(items).toHaveLength(2)
        expect(items.at(0).text()).toBe('post.menu.edit')
        expect(
          items
            .at(0)
            .find('span.ds-menu-item-link')
            .attributes('to'),
        ).toBe('/post/edit/d23a4265-f5f7-4e17-9f86-85f714b4b9f8')
        expect(items.at(1).text()).toBe('post.menu.delete')
        expect(
          items
            .at(1)
            .find('span.ds-menu-item-link')
            .attributes('to'),
        ).toBe('/post-menu-delete')
        items.at(1).trigger('click')
        expect(openModalSpy).toHaveBeenCalledWith('delete')
      })

      it('admin can pin unpinned post', () => {
        getters['auth/isAdmin'] = () => true
        const wrapper = openContentMenu({
          isOwner: false,
          resourceType: 'contribution',
          resource: {
            id: 'd23a4265-f5f7-4e17-9f86-85f714b4b9f8',
            pinnedBy: null,
          },
        })
        let items = wrapper.findAll('.ds-menu-item')
        expect(items.at(0).text()).toBe('post.menu.pin')
        expect(
          items
            .at(0)
            .find('span.ds-menu-item-link')
            .attributes('to'),
        ).toBe('/post-menu-pin')
        items.at(0).trigger('click')
        expect(wrapper.emitted('pinPost')).toEqual([
          [
            {
              id: 'd23a4265-f5f7-4e17-9f86-85f714b4b9f8',
              pinnedBy: null,
            },
          ],
        ])
      })

      it('admin can unpin pinned post', () => {
        const wrapper = openContentMenu({
          isOwner: false,
          resourceType: 'contribution',
          resource: {
            id: 'd23a4265-f5f7-4e17-9f86-85f714b4b9f8',
            pinnedBy: 'someone',
          },
        })
        let items = wrapper.findAll('.ds-menu-item')
        // for (var i = 0; i < items.length; i++) { console.log(items.at(i).html()) }
        expect(items.at(0).text()).toBe('post.menu.unpin')
        expect(
          items
            .at(0)
            .find('span.ds-menu-item-link')
            .attributes('to'),
        ).toBe('/post-menu-unpin')
        items.at(0).trigger('click')
        expect(wrapper.emitted('unpinPost')).toEqual([
          [
            {
              id: 'd23a4265-f5f7-4e17-9f86-85f714b4b9f8',
              pinnedBy: 'someone',
            },
          ],
        ])
      })
    })

    describe('comment', () => {
      it('owner can edit and delete comment', () => {
        const wrapper = openContentMenu({
          isOwner: true,
          resourceType: 'comment',
          resource: {
            id: 'd23a4265-f5f7-4e17-9f86-85f714b4b9f8',
          },
        })
        openModalSpy = jest.spyOn(wrapper.vm, 'openModal')
        let items = wrapper.findAll('.ds-menu-item')
        expect(items).toHaveLength(2)
        expect(items.at(0).text()).toBe('comment.menu.edit')
        expect(
          items
            .at(0)
            .find('span.ds-menu-item-link')
            .attributes('to'),
        ).toBe('/comment-menu-edit')
        items.at(0).trigger('click')
        expect(wrapper.emitted('showEditCommentMenu')).toEqual([[true]])
        expect(items.at(1).text()).toBe('comment.menu.delete')
        expect(
          items
            .at(1)
            .find('span.ds-menu-item-link')
            .attributes('to'),
        ).toBe('/comment-menu-delete')
        items.at(1).trigger('click')
        expect(openModalSpy).toHaveBeenCalledWith('delete')
      })
    })

    describe('report', () => {
      it('anyone who is not owner can report post', () => {
        getters['auth/isAdmin'] = () => false
        getters['auth/isModerator'] = () => false
        const wrapper = openContentMenu({
          isOwner: false,
          resourceType: 'contribution',
          resource: {
            id: 'd23a4265-f5f7-4e17-9f86-85f714b4b9f8',
          },
        })
        openModalSpy = jest.spyOn(wrapper.vm, 'openModal')
        let items = wrapper.findAll('.ds-menu-item')
        expect(items).toHaveLength(1)
        expect(items.at(0).text()).toBe('report.contribution.title')
        expect(
          items
            .at(0)
            .find('span.ds-menu-item-link')
            .attributes('to'),
        ).toBe('/report-contribution-title')
        items.at(0).trigger('click')
        expect(openModalSpy).toHaveBeenCalledWith('report')
      })

      it('anyone who is not owner can report comment', () => {
        const wrapper = openContentMenu({
          isOwner: false,
          resourceType: 'comment',
          resource: {
            id: 'd23a4265-f5f7-4e17-9f86-85f714b4b9f8',
          },
        })
        openModalSpy = jest.spyOn(wrapper.vm, 'openModal')
        let items = wrapper.findAll('.ds-menu-item')
        expect(items).toHaveLength(1)
        expect(items.at(0).text()).toBe('report.comment.title')
        expect(
          items
            .at(0)
            .find('span.ds-menu-item-link')
            .attributes('to'),
        ).toBe('/report-comment-title')
        items.at(0).trigger('click')
        expect(openModalSpy).toHaveBeenCalledWith('report')
      })

      it('other users can be reported', () => {
        const wrapper = openContentMenu({
          isOwner: false,
          resourceType: 'user',
          resource: {
            id: 'd23a4265-f5f7-4e17-9f86-85f714b4b9f8',
          },
        })
        openModalSpy = jest.spyOn(wrapper.vm, 'openModal')
        let items = wrapper.findAll('.ds-menu-item')
        expect(items).toHaveLength(2)
        expect(items.at(0).text()).toBe('report.user.title')
        expect(
          items
            .at(0)
            .find('span.ds-menu-item-link')
            .attributes('to'),
        ).toBe('/report-user-title')
        items.at(0).trigger('click')
        expect(openModalSpy).toHaveBeenCalledWith('report')
      })

      it('other organizations can be reported', () => {
        const wrapper = openContentMenu({
          isOwner: false,
          resourceType: 'organization',
          resource: {
            id: 'd23a4265-f5f7-4e17-9f86-85f714b4b9f8',
          },
        })
        openModalSpy = jest.spyOn(wrapper.vm, 'openModal')
        let items = wrapper.findAll('.ds-menu-item')
        expect(items).toHaveLength(1)
        expect(items.at(0).text()).toBe('report.organization.title')
        expect(
          items
            .at(0)
            .find('span.ds-menu-item-link')
            .attributes('to'),
        ).toBe('/report-organization-title')
        items.at(0).trigger('click')
        expect(openModalSpy).toHaveBeenCalledWith('report')
      })
    })

    describe('moderator', () => {
      it('moderator can disable posts', () => {
        getters['auth/isAdmin'] = () => false
        getters['auth/isModerator'] = () => true
        const wrapper = openContentMenu({
          isOwner: false,
          resourceType: 'contribution',
          resource: {
            id: 'd23a4265-f5f7-4e17-9f86-85f714b4b9f8',
            disabled: false,
          },
        })
        openModalSpy = jest.spyOn(wrapper.vm, 'openModal')
        let items = wrapper.findAll('.ds-menu-item')
        expect(items).toHaveLength(2)
        expect(items.at(1).text()).toBe('disable.contribution.title')
        expect(
          items
            .at(1)
            .find('span.ds-menu-item-link')
            .attributes('to'),
        ).toBe('/disable-contribution-title')
        items.at(1).trigger('click')
        expect(openModalSpy).toHaveBeenCalledWith('disable')
      })

      it('moderator can disable comments', () => {
        const wrapper = openContentMenu({
          isOwner: false,
          resourceType: 'comment',
          resource: {
            id: 'd23a4265-f5f7-4e17-9f86-85f714b4b9f8',
            disabled: false,
          },
        })
        openModalSpy = jest.spyOn(wrapper.vm, 'openModal')
        let items = wrapper.findAll('.ds-menu-item')
        expect(items).toHaveLength(2)
        expect(items.at(1).text()).toBe('disable.comment.title')
        expect(
          items
            .at(1)
            .find('span.ds-menu-item-link')
            .attributes('to'),
        ).toBe('/disable-comment-title')
        items.at(1).trigger('click')
        expect(openModalSpy).toHaveBeenCalledWith('disable')
      })

      it('moderator can disable users', () => {
        const wrapper = openContentMenu({
          isOwner: false,
          resourceType: 'user',
          resource: {
            id: 'd23a4265-f5f7-4e17-9f86-85f714b4b9f8',
            disabled: false,
          },
        })
        openModalSpy = jest.spyOn(wrapper.vm, 'openModal')
        let items = wrapper.findAll('.ds-menu-item')
        expect(items).toHaveLength(3)
        expect(items.at(1).text()).toBe('disable.user.title')
        expect(
          items
            .at(1)
            .find('span.ds-menu-item-link')
            .attributes('to'),
        ).toBe('/disable-user-title')
        items.at(1).trigger('click')
        expect(openModalSpy).toHaveBeenCalledWith('disable')
      })

      it('moderator can disable organizations', () => {
        const wrapper = openContentMenu({
          isOwner: false,
          resourceType: 'organization',
          resource: {
            id: 'd23a4265-f5f7-4e17-9f86-85f714b4b9f8',
            disabled: false,
          },
        })
        openModalSpy = jest.spyOn(wrapper.vm, 'openModal')
        let items = wrapper.findAll('.ds-menu-item')
        // for (var i = 0; i < items.length; i++) { console.log(items.at(i).html()) }
        expect(items).toHaveLength(2)
        expect(items.at(1).text()).toBe('disable.organization.title')
        expect(
          items
            .at(1)
            .find('span.ds-menu-item-link')
            .attributes('to'),
        ).toBe('/disable-organization-title')
        items.at(1).trigger('click')
        expect(openModalSpy).toHaveBeenCalledWith('disable')
      })

      it('moderator can release posts', () => {
        const wrapper = openContentMenu({
          isOwner: false,
          resourceType: 'contribution',
          resource: {
            id: 'd23a4265-f5f7-4e17-9f86-85f714b4b9f8',
            disabled: true,
          },
        })
        openModalSpy = jest.spyOn(wrapper.vm, 'openModal')
        let items = wrapper.findAll('.ds-menu-item')
        expect(items).toHaveLength(2)
        expect(items.at(1).text()).toBe('release.contribution.title')
        expect(
          items
            .at(1)
            .find('span.ds-menu-item-link')
            .attributes('to'),
        ).toBe('/release-contribution-title')
        items.at(1).trigger('click')
        expect(openModalSpy).toHaveBeenCalledWith('release', 'd23a4265-f5f7-4e17-9f86-85f714b4b9f8')
      })

      it('moderator can release comments', () => {
        const wrapper = openContentMenu({
          isOwner: false,
          resourceType: 'comment',
          resource: {
            id: 'd23a4265-f5f7-4e17-9f86-85f714b4b9f8',
            disabled: true,
          },
        })
        openModalSpy = jest.spyOn(wrapper.vm, 'openModal')
        let items = wrapper.findAll('.ds-menu-item')
        expect(items).toHaveLength(2)
        expect(items.at(1).text()).toBe('release.comment.title')
        expect(
          items
            .at(1)
            .find('span.ds-menu-item-link')
            .attributes('to'),
        ).toBe('/release-comment-title')
        items.at(1).trigger('click')
        expect(openModalSpy).toHaveBeenCalledWith('release', 'd23a4265-f5f7-4e17-9f86-85f714b4b9f8')
      })

      it('moderator can release users', () => {
        const wrapper = openContentMenu({
          isOwner: false,
          resourceType: 'user',
          resource: {
            id: 'd23a4265-f5f7-4e17-9f86-85f714b4b9f8',
            disabled: true,
          },
        })
        openModalSpy = jest.spyOn(wrapper.vm, 'openModal')
        let items = wrapper.findAll('.ds-menu-item')
        expect(items).toHaveLength(3)
        expect(items.at(1).text()).toBe('release.user.title')
        expect(
          items
            .at(1)
            .find('span.ds-menu-item-link')
            .attributes('to'),
        ).toBe('/release-user-title')
        items.at(1).trigger('click')
        expect(openModalSpy).toHaveBeenCalledWith('release', 'd23a4265-f5f7-4e17-9f86-85f714b4b9f8')
      })

      it('moderator can release organizations', () => {
        const wrapper = openContentMenu({
          isOwner: false,
          resourceType: 'organization',
          resource: {
            id: 'd23a4265-f5f7-4e17-9f86-85f714b4b9f8',
            disabled: true,
          },
        })
        openModalSpy = jest.spyOn(wrapper.vm, 'openModal')
        let items = wrapper.findAll('.ds-menu-item')
        expect(items).toHaveLength(2)
        expect(items.at(1).text()).toBe('release.organization.title')
        expect(
          items
            .at(1)
            .find('span.ds-menu-item-link')
            .attributes('to'),
        ).toBe('/release-organization-title')
        items.at(1).trigger('click')
        expect(openModalSpy).toHaveBeenCalledWith('release', 'd23a4265-f5f7-4e17-9f86-85f714b4b9f8')
      })
    })

    describe('user', () => {
      it('user can access settings', () => {
        getters['auth/isAdmin'] = () => false
        getters['auth/isModerator'] = () => false
        const wrapper = openContentMenu({
          isOwner: true,
          resourceType: 'user',
          resource: {
            id: 'd23a4265-f5f7-4e17-9f86-85f714b4b9f8',
          },
        })
        let items = wrapper.findAll('.ds-menu-item')
        expect(items).toHaveLength(1)
        expect(items.at(0).text()).toBe('settings.name')
        expect(
          items
            .at(0)
            .find('span.ds-menu-item-link')
            .attributes('to'),
        ).toBe('/settings')
      })

      it('user can block other users', () => {
        const wrapper = openContentMenu({
          isOwner: false,
          resourceType: 'user',
          resource: {
            id: 'd23a4265-f5f7-4e17-9f86-85f714b4b9f8',
            isBlocked: false,
          },
        })
        let items = wrapper.findAll('.ds-menu-item')
        expect(items).toHaveLength(2)
        expect(items.at(1).text()).toBe('settings.blocked-users.block')
        expect(
          items
            .at(1)
            .find('span.ds-menu-item-link')
            .attributes('to'),
        ).toBe('/settings-blocked-users-block')
        items.at(1).trigger('click')
        expect(wrapper.emitted('block')).toEqual([
          [
            {
              id: 'd23a4265-f5f7-4e17-9f86-85f714b4b9f8',
              isBlocked: false,
            },
          ],
        ])
      })

      it('user can unblock blocked users', () => {
        const wrapper = openContentMenu({
          isOwner: false,
          resourceType: 'user',
          resource: {
            id: 'd23a4265-f5f7-4e17-9f86-85f714b4b9f8',
            isBlocked: true,
          },
        })
        let items = wrapper.findAll('.ds-menu-item')
        // for (var i = 0; i < items.length; i++) { console.log(items.at(i).html()) }
        expect(items).toHaveLength(2)
        expect(items.at(1).text()).toBe('settings.blocked-users.unblock')
        expect(
          items
            .at(1)
            .find('span.ds-menu-item-link')
            .attributes('to'),
        ).toBe('/settings-blocked-users-unblock')
        items.at(1).trigger('click')
        expect(wrapper.emitted('unblock')).toEqual([
          [
            {
              id: 'd23a4265-f5f7-4e17-9f86-85f714b4b9f8',
              isBlocked: true,
            },
          ],
        ])
      })
    })
  })
})
