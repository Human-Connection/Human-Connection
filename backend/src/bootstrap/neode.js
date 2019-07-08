import Neode from 'neode'
import models from '../models'

export default function setupNeode(options) {
  const { uri, username, password } = options
  const neodeInstance = new Neode(uri, username, password)
  neodeInstance.with(models)
  return neodeInstance
}
