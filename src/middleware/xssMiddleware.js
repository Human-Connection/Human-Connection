import walkRecursive from '../helpers/walkRecursive'
// import { getByDot, setByDot, getItems, replaceItems } from 'feathers-hooks-common'
import sanitizeHtml from 'sanitize-html'
// import { isEmpty, intersection } from 'lodash'
import cheerio from 'cheerio'
import linkifyHtml from 'linkifyjs/html'

const embedToAnchor = (content) => {
  const $ = cheerio.load(content)
  $('div[data-url-embed]').each((i, el) => {
    let url = el.attribs['data-url-embed']
    let aTag = $(`<a href="${url}" target="_blank" data-url-embed="">${url}</a>`)
    $(el).replaceWith(aTag)
  })
  return $('body').html()
}

function clean (dirty) {
  if (!dirty) {
    return dirty
  }

  // Convert embeds to a-tags
  dirty = embedToAnchor(dirty)
  dirty = linkifyHtml(dirty)
  dirty = sanitizeHtml(dirty, {
    allowedTags: ['iframe', 'img', 'p', 'h3', 'h4', 'br', 'hr', 'b', 'i', 'em', 'strong', 'a', 'pre', 'ul', 'li', 'ol', 's', 'strike', 'span', 'blockquote'],
    allowedAttributes: {
      a: ['href', 'class', 'target', 'data-*', 'contenteditable'],
      span: ['contenteditable', 'class', 'data-*'],
      img: ['src'],
      iframe: ['src', 'class', 'frameborder', 'allowfullscreen']
    },
    allowedIframeHostnames: ['www.youtube.com', 'player.vimeo.com'],
    parser: {
      lowerCaseTags: true
    },
    transformTags: {
      iframe: function (tagName, attribs) {
        return {
          tagName: 'a',
          text: attribs.src,
          attribs: {
            href: attribs.src,
            target: '_blank',
            'data-url-embed': ''
          }
        }
      },
      h1: 'h3',
      h2: 'h3',
      h3: 'h3',
      h4: 'h4',
      h5: 'strong',
      i: 'em',
      a: function (tagName, attribs) {
        return {
          tagName: 'a',
          attribs: {
            href: attribs.href,
            target: '_blank',
            rel: 'noopener noreferrer nofollow'
          }
        }
      },
      b: 'strong',
      s: 'strike',
      img: function (tagName, attribs) {
        let src = attribs.src

        if (!src) {
          // remove broken images
          return {}
        }

        // if (isEmpty(hook.result)) {
        //   const config = hook.app.get('thumbor')
        //   if (config && src.indexOf(config < 0)) {
        //     // download image
        //     // const ThumborUrlHelper = require('../helper/thumbor-helper')
        //     // const Thumbor = new ThumborUrlHelper(config.key || null, config.url || null)
        //     // src = Thumbor
        //     //   .setImagePath(src)
        //     //   .buildUrl('740x0')
        //   }
        // }
        return {
          tagName: 'img',
          attribs: {
            // TODO: use environment variables
            src: `http://localhost:3050/images?url=${src}`
          }
        }
      }
    }
  })

  // remove empty html tags and duplicated linebreaks and returns
  dirty = dirty
    // remove all tags with "space only"
    .replace(/<[a-z-]+>[\s]+<\/[a-z-]+>/gim, '')
    // remove all iframes
    .replace(
      /(<iframe(?!.*?src=(['"]).*?\2)[^>]*)(>)[^>]*\/*>/gim,
      ''
    )
    .replace(/[\n]{3,}/gim, '\n\n')
    .replace(/(\r\n|\n\r|\r|\n)/g, '<br>$1')

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
    .replace(/(\s*<br ?\/?>\s*)+<\/p+>/gim, '</p>')
  return dirty
}

const fields = ['content', 'contentExcerpt']

export default {
  Mutation: async (resolve, root, args, context, info) => {
    args = walkRecursive(args, fields, clean)
    const result = await resolve(root, args, context, info)
    return result
  },
  Query: async (resolve, root, args, context, info) => {
    const result = await resolve(root, args, context, info)
    return walkRecursive(result, fields, clean)
  }
}
