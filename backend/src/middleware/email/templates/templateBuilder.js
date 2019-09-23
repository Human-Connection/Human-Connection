import fs from 'fs'
import path from 'path'
import mustache from 'mustache'
import CONFIG from '../../../config'

const from = '"Human Connection" <info@human-connection.org>'
const supportUrl = 'https://human-connection.org/en/contact'

const signupHtml = fs.readFileSync(path.join(__dirname, './signup.html'), 'utf-8')
const passwordResetHtml = fs.readFileSync(path.join(__dirname, './resetPassword.html'), 'utf-8')
const wrongAccountHtml = fs.readFileSync(path.join(__dirname, './wrongAccount.html'), 'utf-8')

export const signupTemplate = ({ email, nonce }) => {
  const actionUrl = new URL('/registration/create-user-account', CONFIG.CLIENT_URI)
  actionUrl.searchParams.set('nonce', nonce)
  actionUrl.searchParams.set('email', email)

  return {
    from,
    to: email,
    subject: 'Willkommen, Bienvenue, Welcome to Human Connection!',
    html: mustache.render(signupHtml, { actionUrl, supportUrl }),
  }
}

export const resetPasswordTemplate = ({ email, nonce, name }) => {
  const actionUrl = new URL('/password-reset/change-password', CONFIG.CLIENT_URI)
  actionUrl.searchParams.set('nonce', nonce)
  actionUrl.searchParams.set('email', email)

  return {
    from,
    to: email,
    subject: 'Neues Passwort | Reset Password',
    html: mustache.render(passwordResetHtml, { actionUrl, name, nonce, supportUrl }),
  }
}

export const wrongAccountTemplate = ({ email }) => {
  const actionUrl = new URL('/password-reset/request', CONFIG.CLIENT_URI)

  return {
    from,
    to: email,
    subject: 'Falsche Mailadresse? | Wrong E-mail?',
    html: mustache.render(wrongAccountHtml, { actionUrl, supportUrl }),
  }
}
