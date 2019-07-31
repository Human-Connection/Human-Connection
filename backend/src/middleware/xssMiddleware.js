import walkRecursive from '../helpers/walkRecursive'
// import { getByDot, setByDot, getItems, replaceItems } from 'feathers-hooks-common'
import sanitizeHtml from 'sanitize-html'
// import { isEmpty, intersection } from 'lodash'
import linkifyHtml from 'linkifyjs/html'

function clean(dirty) {
  if (!dirty) {
    return dirty
  }

  // Convert embeds to a-tags
  dirty = linkifyHtml(dirty)
  dirty = sanitizeHtml(dirty, {
    allowedTags: [
      'img',
      'p',
      'h3',
      'h4',
      'br',
      'hr',
      'b',
      'i',
      'em',
      'strong',
      'a',
      'pre',
      'ul',
      'li',
      'ol',
      's',
      'strike',
      'span',
      'blockquote',
    ],
    allowedAttributes: {
      a: ['href', 'class', 'target', 'data-*', 'contenteditable'],
      span: ['contenteditable', 'class', 'data-*'],
      img: ['src'],
    },
    allowedIframeHostnames: ['www.youtube.com', 'player.vimeo.com'],
    parser: {
      lowerCaseTags: true,
    },
    transformTags: {
      h1: 'h3',
      h2: 'h3',
      h3: 'h3',
      h4: 'h4',
      h5: 'strong',
      i: 'em',
      a: (tagName, attribs) => {
        return {
          tagName: 'a',
          attribs: {
            ...attribs,
            href: attribs.href || '',
            target: '_blank',
            rel: 'noopener noreferrer nofollow',
          },
        }
      },
      b: 'strong',
      s: 'strike',
    },
  })

  // remove empty html tags and duplicated linebreaks and returns
  dirty = dirty
    // remove all tags with "space only"
    .replace(/<[a-z-]+>[\s]+<\/[a-z-]+>/gim, '')
    .replace(/[\n]{3,}/gim, '\n\n')
    .replace(/(\r\n|\n\r|\r|\n)/g, '<br>$1')

    // replace all p tags with line breaks (and spaces) only by single linebreaks
    // limit linebreaks to max 2 (equivalent to html "br" linebreak)
    .replace(/(<br ?\/?>\s*){2,}/gim, '<br>')
    // remove additional linebreaks after p tags
    .replace(/<\/(p|div|th|tr)>\s*(<br ?\/?>\s*)+\s*<(p|div|th|tr)>/gim, '</p><p>')
    // remove additional linebreaks inside p tags
    .replace(/<[a-z-]+>(<[a-z-]+>)*\s*(<br ?\/?>\s*)+\s*(<\/[a-z-]+>)*<\/[a-z-]+>/gim, '')
    // remove additional linebreaks when first child inside p tags
    .replace(/<p>(\s*<br ?\/?>\s*)+/gim, '<p>')
    // remove additional linebreaks when last child inside p tags
    .replace(/(\s*<br ?\/?>\s*)+<\/p+>/gim, '</p>')
  return dirty
}

const fields = ['content', 'contentExcerpt']

export default {
  Mutation: async (resolve, root, args, context, info) => {
    args = walkRecursive(args, fields, clean)
    return resolve(root, args, context, info)
  },
  Query: async (resolve, root, args, context, info) => {
    const result = await resolve(root, args, context, info)
    return walkRecursive(result, fields, clean)
  },
}
