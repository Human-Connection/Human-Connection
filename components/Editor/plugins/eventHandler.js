import { Extension, Plugin } from 'tiptap'
import { Slice } from 'prosemirror-model'

export default class EventHandler extends Extension {
  get name() {
    return 'event_handler'
  }
  get plugins() {
    return [
      new Plugin({
        props: {
          handleDOMEvents: {
            drop(view, event) {
              event.stopImmediatePropagation()
            },
            paste(view, event, slice) {
              console.log('#### PASTE', slice)
              return 'ABC'
            }
          },
          transformPasted(slice) {
            console.log('#### transformPasted', slice)
            return new Slice(slice.content, slice.openStart, slice.openEnd)
          },
          transformPastedHTML(html) {
            console.log('#### transformPastedHTML', html)
            return 'HELLO WORLD'
          }
        }
      })
    ]
  }
}
