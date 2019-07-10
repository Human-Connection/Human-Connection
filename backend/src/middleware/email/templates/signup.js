import CONFIG from '../../../config'

export const from = '"Human Connection" <info@human-connection.org>'

export const signupTemplate = options => {
  const {
    email,
    nonce,
    subject = 'Signup link',
    supportUrl = 'https://human-connection.org/en/contact/',
  } = options
  const actionUrl = new URL('/registration/create-user-account', CONFIG.CLIENT_URI)
  actionUrl.searchParams.set('nonce', nonce)

  return {
    to: email,
    subject,
    text: `
Welcome to Human Connection! Use this link to complete the registration process
and create a user account:

${actionUrl}

You can also copy+paste this verification code in your browser window:

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
