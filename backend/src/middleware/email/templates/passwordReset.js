import fs from 'fs'
import path from 'path'
import mustache from 'mustache'
import CONFIG from '../../../config'

const passwordResetHtml = fs.readFileSync(path.join(__dirname, './resetPassword.html'), 'utf-8')

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
    text: `
We received a request to reset the password to access Human Connection with your
email address, but we were unable to find an account associated with this
address.

If you use Human Connection and were expecting this email, consider trying to
request a password reset using the email address associated with your account.
Try a different email:

${actionUrl}

If you do not use Human Connection or did not request a password reset, please
ignore this email. Feel free to contact support if you have further questions:

${supportUrl}

Thanks,
The Human Connection Team

Human Connection gemeinnützige GmbH
Bahnhofstr. 11
73235 Weilheim / Teck
Deutschland
  `,
  }
}
