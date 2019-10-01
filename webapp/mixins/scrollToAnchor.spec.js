import { scrollTo } from 'vue-scrollto'
import scrollToAnchor from './scrollToAnchor'
jest.mock('vue-scrollto')

let component

describe('scrollToAnchor', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    scrollTo.mockClear()
  })

  describe('scrollToAnchor', () => {
    const action = hash => {
      let {
        watch: { $route },
      } = scrollToAnchor
      $route.bind(component)({ hash })
      jest.runAllTimers()
    }

    describe('given anchor `commentId-4711`', () => {
      beforeEach(() => {
        component = {
          anchor: 'commentId-4711',
          checkAnchor(anchor) {
            return this.anchor === anchor
          },
        }
      })

      describe('$route.hash === anchor', () => {
        it('calls window.scroll', () => {
          action('commentId-4711')
          expect(scrollTo).toHaveBeenCalled()
        })
      })

      describe('$route.hash !== anchor', () => {
        it('skips window.scroll', () => {
          action('commentId-4712')
          expect(scrollTo).not.toHaveBeenCalled()
        })
      })
    })
  })
})
