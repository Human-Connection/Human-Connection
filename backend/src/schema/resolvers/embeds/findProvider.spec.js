import findProvider from './findProvider'

describe('Vimeo', () => {
  it('matches `https://vimeo.com/showcase/2098620/video/4082288`', () => {
    expect(findProvider('https://vimeo.com/showcase/2098620/video/4082288')).toEqual(
      'https://vimeo.com/api/oembed.json',
    )
  })
})

describe('D.Tube', () => {
  it('matches `https://d.tube/v/alexshumsky/q4D-hIOjknY`', () => {
    expect(findProvider('https://d.tube/v/alexshumsky/q4D-hIOjknY')).toEqual(
      'https://api.d.tube/oembed',
    )
  })
})

describe('GIPHY', () => {
  it('matches `https://giphy.com/gifs/KRB0DCpSFQeT6/html5`', () => {
    expect(findProvider('https://giphy.com/gifs/KRB0DCpSFQeT6/html5')).toEqual(
      'https://giphy.com/services/oembed',
    )
  })
})

describe('Flicker', () => {
  it('matches `https://flic.kr/p/VT2HCQ`', () => {
    expect(findProvider('https://flic.kr/p/VT2HCQ')).toEqual(
      'https://www.flickr.com/services/oembed/',
    )
  })
})

describe('Codepen', () => {
  it('matches `https://codepen.io/goodkatz/pen/LYPGxQz`', () => {
    expect(findProvider('https://codepen.io/goodkatz/pen/LYPGxQz')).toEqual(
      'http://codepen.io/api/oembed',
    )
  })
})

describe('Meetup', () => {
  it('matches `https://www.meetup.com/de-DE/spielego/events/ctdplqyzmbfc/`', () => {
    expect(findProvider('https://www.meetup.com/de-DE/spielego/events/ctdplqyzmbfc/')).toEqual(
      'https://api.meetup.com/oembed',
    )
  })
})

describe('Mixcloud', () => {
  it('matches `https://www.mixcloud.com/diffrent/giraffecast025/`', () => {
    expect(findProvider('https://www.mixcloud.com/diffrent/giraffecast025/')).toEqual(
      'https://www.mixcloud.com/oembed/',
    )
  })
})

describe('Reddit', () => {
  it('matches `https://www.reddit.com/r/LivestreamFail/comments/d6a2ge/greek_banned/`', () => {
    expect(
      findProvider('https://www.reddit.com/r/LivestreamFail/comments/d6a2ge/greek_banned/'),
    ).toEqual('https://www.reddit.com/oembed')
  })
})

describe('Slideshare', () => {
  it('matches `https://www.slideshare.net/ma6/lets-build-an-airport-how-to-estimate-large-scale-projects`', () => {
    expect(
      findProvider(
        'https://www.slideshare.net/ma6/lets-build-an-airport-how-to-estimate-large-scale-projects',
      ),
    ).toEqual('http://www.slideshare.net/api/oembed/2')
  })
})

describe('Soundcloud', () => {
  it('matches `https://soundcloud.com/placid-records/zangenhand-live-altes-wettb-ro`', () => {
    expect(
      findProvider('https://soundcloud.com/placid-records/zangenhand-live-altes-wettb-ro'),
    ).toEqual('https://soundcloud.com/oembed')
  })
})

describe('Twitch', () => {
  it('matches `https://www.twitch.tv/gtimetv`', () => {
    expect(findProvider('https://www.twitch.tv/gtimetv')).toEqual('https://api.twitch.tv/v4/oembed')
  })
})

describe('Twitter', () => {
  it('matches `https://twitter.com/kenfm/status/1168682881524232194`', () => {
    expect(findProvider('https://twitter.com/kenfm/status/1168682881524232194')).toEqual(
      'https://publish.twitter.com/oembed',
    )
  })
})

describe('Facebook', () => {
  it('matches `https://www.facebook.com/FacebookDeutschland/videos/1960353927603280/`', () => {
    expect(
      findProvider('https://www.facebook.com/FacebookDeutschland/videos/1960353927603280/'),
    ).toEqual('https://www.facebook.com/plugins/post/oembed.json')
  })
})

describe('Youtube', () => {
  it('matches `https://www.youtube.com/watch?v=qkdXAtO40Fo`', () => {
    expect(findProvider('https://www.youtube.com/watch?v=qkdXAtO40Fo')).toEqual(
      'https://www.youtube.com/oembed',
    )
  })

  it('matches `https://youtu.be/qkdXAtO40Fo`', () => {
    expect(findProvider(`https://youtu.be/qkdXAtO40Fo`)).toEqual('https://www.youtube.com/oembed')
  })

  it('matches `https://youtu.be/qkdXAtO40Fo?t=41`', () => {
    expect(findProvider(`https://youtu.be/qkdXAtO40Fo?t=41`)).toEqual(
      'https://www.youtube.com/oembed',
    )
  })
})
