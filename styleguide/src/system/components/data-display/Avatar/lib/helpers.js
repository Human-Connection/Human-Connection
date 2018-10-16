export default {
  backgroundColors: [
    '#295E87',
    '#007D93',
    '#933D86',
    '#005093',
    '#4A5580',
    '#0067A5',
    '#007D93',
    '#007A70',
    '#008F6D',
    '#008255',
    '#43913A',
    '#C61A6A',
    '#15A748',
    '#007FBA',
    '#008AC4',
    '#E1B424',
    '#00753C',
    '#B42554',
    '#4F3B68',
    '#EB8B2D',
    '#DC3E2A',
    '#A7BE33',
    '#DF542A',
    '#00A3DA',
    '#84BF41'
  ],

  initials(name) {
    let un = name || 'Anonymus'
    let parts = un.split(/[ -]/)
    let initials = ''
    for (var i = 0; i < parts.length; i++) {
      initials += parts[i].charAt(0)
    }
    if (initials.length > 3 && initials.search(/[A-Z]/) !== -1) {
      initials = initials.replace(/[a-z]+/g, '')
    }
    initials = initials.substr(0, 3).toUpperCase()
    return initials
  },
  randomBackgroundColor(seed, colors) {
    return colors[seed % colors.length]
  },
  lightenColor(hex, amt) {
    // From https://css-tricks.com/snippets/javascript/lighten-darken-color/
    var usePound = false
    if (hex[0] === '#') {
      hex = hex.slice(1)
      usePound = true
    }
    var num = parseInt(hex, 16)
    var r = (num >> 16) + amt
    if (r > 255) r = 255
    else if (r < 0) r = 0
    var b = ((num >> 8) & 0x00ff) + amt
    if (b > 255) b = 255
    else if (b < 0) b = 0
    var g = (num & 0x0000ff) + amt
    if (g > 255) g = 255
    else if (g < 0) g = 0
    return (usePound ? '#' : '') + (g | (b << 8) | (r << 16)).toString(16)
  }
}
