import gql from 'graphql-tag'

export default function() {
  return gql`
    query($url: String!) {
      embed(url: $url) {
        type
        embed
        title
        description
        author
        publisher
        url
        date
        image
        audio
        video
        lang
        logo
        sources
      }
    }
  `
}
