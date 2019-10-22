// import { mount } from '@vue/test-utils'
// import ReportedContent from './ReportedContent.vue'

let resource // eslint-disable-line no-unused-vars

/**
 * This file is just a sketch. Feel free to change it as needed.
 */

describe('ReportedContent', () => {
  describe('given a post', () => {
    beforeEach(() => {
      resource = {
        /* ? */
      }
    })

    it.todo('links to the post')
  })

  describe('given a comment', () => {
    beforeEach(() => {
      resource = {
        /* ? */
      }
    })

    it.todo('links to the post of the comment')
  })

  describe('given the resource is not disabled', () => {
    beforeEach(() => {
      resource = {
        disabled: false,
        // ...
      }
    })

    it.todo('shows a dash in the column "Disabled by"')
  })

  describe('given the resource is disabled', () => {
    beforeEach(() => {
      resource = {
        disabled: true,
        // ...
      }
    })

    it.todo('shows who disabled the content')
  })
})
