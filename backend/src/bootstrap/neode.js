import Neode from 'neode'

export default function setupNeode(options) {
  const { uri, username, password } = options
  const neodeInstance = new Neode(uri, username, password)
  neodeInstance.withDirectory(`${__dirname}/../models`)
  return neodeInstance
}
