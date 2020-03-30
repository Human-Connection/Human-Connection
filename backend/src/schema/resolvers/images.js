import CONFIG from '../../config/'
import Imgproxy, { Gravity } from 'imgproxy'
import Resolver from './helpers/Resolver'

const { CLIENT_URI, GRAPHQL_URI, IMGPROXY_URI, IMGPROXY_KEY, IMGPROXY_SALT } = CONFIG

const imgproxy = new Imgproxy({
  baseUrl: IMGPROXY_URI,
  key: IMGPROXY_KEY,
  salt: IMGPROXY_SALT,
  encode: true,
})

export default {
  Image: {
    url: (parent, args) => {
      const { url } = parent
      const { width } = args
      if (!width) return url
      const { href: absoluteUrl } = new URL(url, `${CLIENT_URI}/imgproxy`)
      return imgproxy
        .builder()
        .resize('fill', width, 0, 0)
        .gravity(Gravity.smart)
        .generateUrl(absoluteUrl)
    },
    ...Resolver('Image', {
      undefinedToNull: ['sensitive', 'alt', 'aspectRatio'],
    }),
  },
}
