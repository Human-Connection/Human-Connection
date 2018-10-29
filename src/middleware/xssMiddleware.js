import trunc from 'trunc-html'
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
    allowedTags: ['iframe', 'img', 'p', 'br', 'b', 'i', 'em', 'strong', 'a', 'pre', 'ul', 'li', 'ol', 's', 'strike', 'span', 'blockquote'],
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
      i: 'em',
      // a: function (tagName, attribs) {
      //   return {
      //     tagName: 'a',
      //     attribs: {
      //       href: attribs.href,
      //       target: '_blank',
      //     }
      //   }
      // },
      b: 'strong',
      s: 'strike',
      img: function (tagName, attribs) {
        let src = attribs.src

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
    .replace(/<[a-z]>[\s]*<\/[a-z]>/igm, '')
    // remove all iframes
    .replace(/(<iframe(?!.*?src=(['"]).*?\2)[^>]*)(>)[^>]*\/*>/igm, '')
    // replace all p tags with line breaks (and spaces) only by single linebreaks
    .replace(/<p>[\s]*(<br ?\/?>)+[\s]*<\/p>/igm, '<br>')
    // replace multiple linebreaks with single ones
    // limit linebreaks to max 2 (equivalent to html "br" linebreak)
    .replace(/(<br ?\/?>){2,}/igm, '<br>')
    .replace(/[\n]{3,}/igm, '\n\n')
    .replace(/(\r\n|\n\r|\r|\n)/g, '<br>$1')
    // remove additional linebreaks inside p tags
    .replace(/<p><br><\/p>/g, '')
  return dirty
}

// iterate through all fields and clean the values
function cleanAll (result, key, recursive, fields = ['content', 'contentExcerpt']) {
  if (result && typeof result === 'string' && fields.includes(key)) {
    result = clean(result)
  } else if (result && Array.isArray(result)) {
    result.forEach((res, index) => {
      result[index] = cleanAll(result[index], index, true, fields)
    })
  } else if (result && typeof result === 'object') {
    Object.keys(result).forEach(key => {
      result[key] = cleanAll(result[key], key, true, fields)
    })
  }
  return result
}

export default {
  Mutation: async (resolve, root, args, context, info) => {
    args = cleanAll(args)
    const result = await resolve(root, args, context, info)
    return result
  },
  Query: async (resolve, root, args, context, info) => {
    const result = await resolve(root, args, context, info)
    return cleanAll(result)
  }
}
