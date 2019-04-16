export default {
  methods: {
    removeLinks(content) {
      if (!content) return ''
      // remove all links from excerpt to prevent issues with the surrounding link
      let excerpt = content.replace(/<a.*>(.+)<\/a>/gim, '$1')
      // do not display content that is only linebreaks
      if (excerpt.replace(/<br>/gim, '').trim() === '') {
        excerpt = ''
      }

      return excerpt
    }
  }
}
