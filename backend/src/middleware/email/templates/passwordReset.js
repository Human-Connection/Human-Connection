import fs from 'fs'
import path from 'path'
import mustache from 'mustache'
import CONFIG from '../../../config'

const passwordResetHtml = fs.readFileSync(path.join(__dirname, './resetPassword.html'), 'utf-8')
const wrongAccountHtml = fs.readFileSync(path.join(__dirname, './wrongAccount.html'), 'utf-8')

const supportUrl = 'https://human-connection.org/en/contact/'
const from = '"Human Connection" <info@human-connection.org>'

export const resetPasswordTemplate = ({
  name,
  email,
  emailFound,
  nonce,
}) => {
  let subject, htmlTemplate, actionUrl

  if (emailFound) {
    subject = 'Neues Passwort | Reset Password'
    htmlTemplate = passwordResetHtml
    actionUrl = new URL('/password-reset/change-password', CONFIG.CLIENT_URI)
    actionUrl.searchParams.set('nonce', nonce)
    actionUrl.searchParams.set('email', email)
  } else {
    subject = 'Falsche Mailadresse? | Wrong Email?'
    htmlTemplate = wrongAccountHtml
    actionUrl = new URL('/password-reset/request', CONFIG.CLIENT_URI)
  }

  return {
    from,
    to: email,
    subject,
    html: mustache.render(htmlTemplate, { actionUrl, name, nonce, supportUrl }),
  }
}
