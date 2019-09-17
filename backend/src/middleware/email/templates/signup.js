import CONFIG from '../../../config'
import fs from 'fs'
import path from 'path'
import mustache from 'mustache'

const signupHtml = fs.readFileSync(path.join(__dirname, './signup.html'), 'utf-8')

export const signupTemplate = options => {
  const {
    email,
    nonce,
    subject = 'Welcome to Human Connection!',
    supportUrl = 'https://human-connection.org/en/contact/',
  } = options
  const actionUrl = new URL('/registration/create-user-account', CONFIG.CLIENT_URI)
  actionUrl.searchParams.set('nonce', nonce)
  actionUrl.searchParams.set('email', email)

  return {
    to: email,
    subject,
    html: mustache.render(signupHtml, { actionUrl, nonce, supportUrl }),
  }
}
