import findProvider from './findProvider'

describe('Vimeo', () => {
  it('matches `https://vimeo.com/showcase/2098620/video/4082288`', () => {
    expect(findProvider('https://vimeo.com/showcase/2098620/video/4082288')).toEqual(
      'https://vimeo.com/api/oembed.json',
    )
  })
})

describe('RiffReporter', () => {
  it('matches `https://www.riffreporter.de/flugbegleiter-koralle/`', () => {
    expect(findProvider('https://www.riffreporter.de/flugbegleiter-koralle/')).toEqual(
      'https://www.riffreporter.de/service/oembed',
    )
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
