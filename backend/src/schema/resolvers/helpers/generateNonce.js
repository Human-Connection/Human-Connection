import { v4 as uuid } from 'uuid'
export default function generateNonce() {
  return uuid().substring(0, 6)
}
