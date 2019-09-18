import fs from 'fs'
import path from 'path'
import mustache from 'mustache'
import CONFIG from '../../../config'

const signupHtml = fs.readFileSync(path.join(__dirname, './signup.html'), 'utf-8')

export const signupTemplate = ({
  email,
  nonce,
  subject = 'Willkommen, Bienvenue, Welcome to Human Connection!',
  supportUrl = 'https://human-connection.org/en/contact',
}) => {
  const actionUrl = new URL('/registration/create-user-account', CONFIG.CLIENT_URI)
  actionUrl.searchParams.set('nonce', nonce)
  actionUrl.searchParams.set('email', email)

  return {
    from: '"Human Connection" <info@human-connection.org>',
    to: email,
    subject,
    html: mustache.render(signupHtml, { actionUrl, nonce, supportUrl }),
  }
}
