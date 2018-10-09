<template>
  <component
    v-if="parsedComponent"
    :is="parsedComponent"/>
</template>

<script>
import cheerio from 'cheerio'
import Vue from 'vue/dist/vue.common'

import markdownIt from 'markdown-it'
import emoji from 'markdown-it-emoji'
import subscript from 'markdown-it-sub'
import superscript from 'markdown-it-sup'
import footnote from 'markdown-it-footnote'
import deflist from 'markdown-it-deflist'
import abbreviation from 'markdown-it-abbr'
import insert from 'markdown-it-ins'
import mark from 'markdown-it-mark'
import katex from 'markdown-it-katex'
import tasklists from 'markdown-it-task-lists'

export default {
  name: 'Markdown',
  props: {
    content: {
      type: String,
      required: true
    },
    components: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      md: new markdownIt()
        .use(emoji)
        .use(subscript)
        .use(superscript)
        .use(footnote)
        .use(deflist)
        .use(abbreviation)
        .use(insert)
        .use(mark)
        .use(katex, { throwOnError: false, errorColor: ' #cc0000' })
        .use(tasklists)
    }
  },
  computed: {
    parsedComponent() {
      if (!this.content) {
        return false
      }
      return this.parseComponent()
    }
  },
  methods: {
    parseComponent() {
      if (!this.content) {
        return false
      }

      this.md.set({
        html: true,
        xhtmlOut: true,
        linkify: true
      })

      const html = this.md.render(this.content) || ''
      const $ = cheerio.load(html)

      // Replace h-tags
      for (let l = 1; l <= 6; l++) {
        $(`h${l}`).each((i, item) => {
          $(item).replaceWith(
            $(
              '<ds-heading tag="' +
                `h${l}` +
                '">' +
                $(item).html() +
                '</ds-heading>'
            )
          )
        })
      }

      // Replace p-tags
      $('p').each((i, item) => {
        // Handle component tags
        if (
          $(item).children().length &&
          Array.from($(item).children()).some(c => c.name.indexOf('-') > -1)
        ) {
          $(item).replaceWith($('<div>' + $(item).html() + '</div>'))
        } else {
          $(item).replaceWith(
            $('<ds-text size="large">' + $(item).html() + '</ds-text>')
          )
        }
      })

      // Replace ul-tags
      $('ul').each((i, item) => {
        $(item).replaceWith(
          $('<ds-list size="large">' + $(item).html() + '</ds-list>')
        )
      })

      // Replace ol-tags
      $('ol').each((i, item) => {
        $(item).replaceWith(
          $('<ds-list size="large" ordered>' + $(item).html() + '</ds-list>')
        )
      })

      // Replace ol-tags
      $('li').each((i, item) => {
        $(item).replaceWith(
          $('<ds-list-item>' + $(item).html() + '</ds-list-item>')
        )
      })

      const componentHtml = $('body').html()
      const template = `<div>${componentHtml}</div>`
      const component = Vue.compile(template)

      if (this.components) {
        component.components = this.components
      }

      this.$options.components['parsed-markdown-component'] = {
        ...component
      }

      return 'parsed-markdown-component'
    }
  }
}
</script>

<style lang="scss">
</style>
