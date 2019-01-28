import { Extension, Plugin } from 'tiptap'
// import { Slice, Fragment } from 'prosemirror-model'

export default class EventHandler extends Extension {
  get name() {
    return 'event_handler'
  }
  get plugins() {
    return [
      new Plugin({
        props: {
          transformPastedText(text) {
            // console.log('#### transformPastedText', text)
            return text.trim()
          },
          transformPastedHTML(html) {
            html = html
              // remove all tags with "space only"
              .replace(/<[a-z-]+>[\s]+<\/[a-z-]+>/gim, '')
              // remove all iframes
              .replace(
                /(<iframe(?!.*?src=(['"]).*?\2)[^>]*)(>)[^>]*\/*>/gim,
                ''
              )
              .replace(/[\n]{3,}/gim, '\n\n')
              .replace(/(\r\n|\n\r|\r|\n)/g, '<br>')

              // replace all p tags with line breaks (and spaces) only by single linebreaks
              // limit linebreaks to max 2 (equivalent to html "br" linebreak)
              .replace(/(<br ?\/?>\s*){2,}/gim, '<br>')
              // remove additional linebreaks after p tags
              .replace(
                /<\/(p|div|th|tr)>\s*(<br ?\/?>\s*)+\s*<(p|div|th|tr)>/gim,
                '</p><p>'
              )
              // remove additional linebreaks inside p tags
              .replace(
                /<[a-z-]+>(<[a-z-]+>)*\s*(<br ?\/?>\s*)+\s*(<\/[a-z-]+>)*<\/[a-z-]+>/gim,
                ''
              )
              // remove additional linebreaks when first child inside p tags
              .replace(/<p>(\s*<br ?\/?>\s*)+/gim, '<p>')
              // remove additional linebreaks when last child inside p tags
              .replace(/(\s*<br ?\/?>\s*)+<\/p>/gim, '</p>')
            // console.log('#### transformPastedHTML', html)
            return html
          }
          // transformPasted(slice) {
          //   // console.log('#### transformPasted', slice.content)
          //   let content = []
          //   let size = 0
          //   slice.content.forEach((node, offset, index) => {
          //     // console.log(node)
          //     // console.log('isBlock', node.type.isBlock)
          //     // console.log('childCount', node.content.childCount)
          //     // console.log('index', index)
          //     if (node.content.childCount) {
          //       content.push(node.content)
          //       size += node.content.size
          //     }
          //   })
          //   console.log(content)
          //   console.log(slice.content)
          //   let fragment = Fragment.fromArray(content)
          //   fragment.size = size
          //   console.log('#fragment', fragment, slice.content)
          //   console.log('----')
          //   console.log('#1', slice)
          //   // const newSlice = new Slice(fragment, slice.openStart, slice.openEnd)
          //   slice.fragment = fragment
          //   // slice.content.content = fragment.content
          //   // slice.content.size = fragment.size
          //   console.log('#2', slice)
          //   // console.log(newSlice)
          //   console.log('----')
          //   return slice
          //   // return newSlice
          // }
        }
      })
    ]
  }
}
