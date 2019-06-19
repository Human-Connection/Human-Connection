import CONFIG from '../../../config'

export const from = '"Human Connection" <info@human-connection.org>'

export const resetPasswordMail = options => {
  const {
    name,
    email,
    code,
    subject = 'Use this link to reset your password. The link is only valid for 24 hours.',
    supportUrl = 'https://human-connection.org/en/contact/',
  } = options
  const actionUrl = new URL('/password-reset/change-password', CONFIG.CLIENT_URI)
  actionUrl.searchParams.set('code', code)
  actionUrl.searchParams.set('email', email)

  return {
    to: email,
    subject,
    text: `
Hi ${name}!

You recently requested to reset your password for your Human Connection account.
Use the button below to reset it. This password reset is only valid for the next
24 hours.

${actionUrl}

If you did not request a password reset, please ignore this email or contact
support if you have questions:

${supportUrl}

Thanks,
The Human Connection Team

If you’re having trouble with the link above, you can manually copy and
paste the following code into your browser window:

${code}

Human Connection gemeinnützige GmbH
Bahnhofstr. 11
73235 Weilheim / Teck
Deutschland
    `,
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
