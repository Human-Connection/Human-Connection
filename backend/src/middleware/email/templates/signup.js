import CONFIG from '../../../config'

export const from = '"Human Connection" <info@human-connection.org>'

export const signupTemplate = options => {
  const {
    email,
    nonce,
    subject = 'Signup link',
    supportUrl = 'https://human-connection.org/en/contact/',
  } = options
  const actionUrl = new URL('/signup', CONFIG.CLIENT_URI)
  actionUrl.searchParams.set('nonce', nonce)

  return {
    to: email,
    subject,
    text: `
Signup nonce ${nonce}

${actionUrl}

If you did not request a password reset, please ignore this email or contact
support if you have questions:

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
