import gql from 'graphql-tag'

export default function() {
  return gql`
    query($url: String!) {
      embed(url: $url) {
        type
        title
        author
        publisher
        date
        description
        url
        image
        audio
        video
        lang
        sources
        html
      }
    }
  `
}
