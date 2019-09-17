import gql from 'graphql-tag'

export default function() {
  return gql`
    query($url: String!) {
      embed(url: $url) {
        type
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
