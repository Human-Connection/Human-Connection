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
Willkommen bei Human Connection! Benutzen Sie diesen Link, um den Registrierungsprozess abzuschließen.
und erstellen Sie ein Benutzerkonto

${actionUrl}

Sie können diese Verifizierung auch kopieren und in Ihr Browserfenster einfügen:

${nonce}

Wenn du dich nicht bei Human Connection angemeldet hast, ignoriere bitte diese E-Mail oder
Kontaktieren Sie den Support, wenn Sie Fragen haben:

${supportUrl}

Danke,
Das Human Connection Team

Übersetzt mit www.DeepL.com/Translator


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
