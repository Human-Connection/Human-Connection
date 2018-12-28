# Nitro-Embed
API Service for fetching URL Information like images, icons, descriptions etc. thourgh OpenGraph, oEmbed and other standards.

> early version of simpler embed api with Metascraper and oEmbed for better results.

![API Screenshot](screenshot.png)

---

## Todo`s
- [x] Metascraper
- [x] oEmbed
- [ ] API Cache
- [ ] Image Caching

---

## Install and start development server

Install dependencies
```shell
yarn install
```

Start development server
```shell
yarn dev
```

## Example Request
Use the following request by posting it against the endpoint or open the url the `yarn dev` script did gave you and fire it there to get your first result.

```grapql
{
  embed(url: "https://human-connection.org") {
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
```
