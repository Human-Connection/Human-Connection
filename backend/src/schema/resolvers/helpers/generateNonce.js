import uuid from 'uuid/v4'
export default function generateNonce() {
  return uuid().substring(0, 6)
}
