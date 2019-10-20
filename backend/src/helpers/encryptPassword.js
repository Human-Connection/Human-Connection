import { hashSync } from 'bcryptjs'

export default function(args) {
  args.encryptedPassword = hashSync(args.password, 10)
  delete args.password
  return args
}
