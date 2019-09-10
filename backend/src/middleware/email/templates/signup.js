import CONFIG from '../../../config'

export const signupTemplate = options => {
  const {
    email,
    nonce,
    subject = 'Welcome to Human Connection! Here is your signup link.',
    supportUrl = 'https://human-connection.org/en/contact/',
  } = options
  const actionUrl = new URL('/registration/create-user-account', CONFIG.CLIENT_URI)
  actionUrl.searchParams.set('nonce', nonce)
  actionUrl.searchParams.set('email', email)

  return {
    to: email,
    subject,
    text: `
Willkommen bei Human Connection! Klick auf diesen Link, um den
Registrierungsprozess abzuschließen und um ein Benutzerkonto zu erstellen!

${actionUrl}

Alternativ kannst du diesen Code auch kopieren und im Browserfenster einfügen:

${nonce}

Bitte ignoriere diese Mail, falls du dich nicht bei Human Connection angemeldet
hast. Bei Fragen kontaktiere gerne unseren Support:

${supportUrl}

Danke,
Das Human Connection Team


English Version
===============

Welcome to Human Connection! Use this link to complete the registration process
and create a user account:

${actionUrl}

You can also copy+paste this verification nonce in your browser window:

${nonce}

If you did not signed up for Human Connection, please ignore this email or
contact support if you have questions:

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
