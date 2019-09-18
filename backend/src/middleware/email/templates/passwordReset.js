import fs from 'fs'
import path from 'path'
import mustache from 'mustache'
import CONFIG from '../../../config'

const passwordResetHtml = fs.readFileSync(path.join(__dirname, './resetPassword.html'), 'utf-8')
const wrongAccountHtml = fs.readFileSync(path.join(__dirname, './wrongAccount.html'), 'utf-8')

export const resetPasswordMail = ({
  name,
  email,
  nonce,
  subject = 'Neues Passwort / Reset Password',
  supportUrl = 'https://human-connection.org/en/contact/',
}) => {
  const actionUrl = new URL('/password-reset/change-password', CONFIG.CLIENT_URI)
  actionUrl.searchParams.set('nonce', nonce)
  actionUrl.searchParams.set('email', email)

  return {
    from: '"Human Connection" <info@human-connection.org>',
    to: email,
    subject,
    html: mustache.render(passwordResetHtml, { actionUrl, name, nonce, supportUrl }),
  }
}

export const wrongAccountMail = options => {
  const {
    email,
    subject = `We received a request to reset your password with this email address (${email})`,
    supportUrl = 'https://human-connection.org/en/contact/',
  } = options
  const actionUrl = new URL('/password-reset/request', CONFIG.CLIENT_URI)
  return {
    from: '"Human Connection" <info@human-connection.org>',
    to: email,
    subject,
    html: mustache.render(wrongAccountHtml, { actionUrl, supportUrl }),
  }
}
