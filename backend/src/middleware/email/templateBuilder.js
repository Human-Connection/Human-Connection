import mustache from 'mustache'
import CONFIG from '../../config'

import * as templates from './templates'

const from = '"Human Connection" <info@human-connection.org>'
const supportUrl = 'https://human-connection.org/en/contact'

export const signupTemplate = ({ email, nonce }) => {
  const subject = 'Willkommen, Bienvenue, Welcome to Human Connection!'
  const actionUrl = new URL('/registration/create-user-account', CONFIG.CLIENT_URI)
  actionUrl.searchParams.set('nonce', nonce)
  actionUrl.searchParams.set('email', email)

  return {
    from,
    to: email,
    subject,
    html: mustache.render(
      templates.layout,
      { actionUrl, nonce, supportUrl, subject },
      { content: templates.signup },
    ),
  }
}

export const emailVerificationTemplate = ({ email, nonce, name }) => {
  const subject = 'Neue E-Mail Adresse | New E-Mail Address'
  const actionUrl = new URL('/settings/my-email-address/verify', CONFIG.CLIENT_URI)
  actionUrl.searchParams.set('nonce', nonce)
  actionUrl.searchParams.set('email', email)

  return {
    from,
    to: email,
    subject,
    html: mustache.render(
      templates.layout,
      { actionUrl, name, nonce, supportUrl, subject },
      { content: templates.emailVerification },
    ),
  }
}

export const resetPasswordTemplate = ({ email, nonce, name }) => {
  const subject = 'Neues Passwort | Reset Password'
  const actionUrl = new URL('/password-reset/change-password', CONFIG.CLIENT_URI)
  actionUrl.searchParams.set('nonce', nonce)
  actionUrl.searchParams.set('email', email)

  return {
    from,
    to: email,
    subject,
    html: mustache.render(
      templates.layout,
      { actionUrl, name, nonce, supportUrl, subject },
      { content: templates.passwordReset },
    ),
  }
}

export const wrongAccountTemplate = ({ email }) => {
  const subject = 'Falsche Mailadresse? | Wrong E-mail?'
  const actionUrl = new URL('/password-reset/request', CONFIG.CLIENT_URI)

  return {
    from,
    to: email,
    subject,
    html: mustache.render(
      templates.layout,
      { actionUrl, supportUrl },
      { content: templates.wrongAccount },
    ),
  }
}
