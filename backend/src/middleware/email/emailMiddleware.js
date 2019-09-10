import CONFIG from '../../config'
import nodemailer from 'nodemailer'
import { resetPasswordMail, wrongAccountMail } from './templates/passwordReset'
import { signupTemplate } from './templates/signup'

let sendMail
if (CONFIG.SMTP_HOST && CONFIG.SMTP_PORT) {
  sendMail = async templateArgs => {
    await transporter().sendMail({
      from: '"Human Connection" <info@human-connection.org>',
      ...templateArgs,
    })
  }
} else {
  sendMail = () => {}
  if (process.env.NODE_ENV !== 'test') {
    // eslint-disable-next-line no-console
    console.log('Warning: Email middleware will not try to send mails.')
  }
}

const transporter = () => {
  const configs = {
    host: CONFIG.SMTP_HOST,
    port: CONFIG.SMTP_PORT,
    ignoreTLS: CONFIG.SMTP_IGNORE_TLS,
    secure: false, // true for 465, false for other ports
  }
  const { SMTP_USERNAME: user, SMTP_PASSWORD: pass } = CONFIG
  if (user && pass) {
    configs.auth = { user, pass }
  }
  return nodemailer.createTransport(configs)
}

const sendSignupMail = async (resolve, root, args, context, resolveInfo) => {
  const response = await resolve(root, args, context, resolveInfo)
  const { email, nonce } = response
  await sendMail(signupTemplate({ email, nonce }))
  delete response.nonce
  return response
}

export default {
  Mutation: {
    requestPasswordReset: async (resolve, root, args, context, resolveInfo) => {
      const { email } = args
      const { email: emailFound, nonce, name } = await resolve(root, args, context, resolveInfo)
      const mailTemplate = emailFound ? resetPasswordMail : wrongAccountMail
      await sendMail(mailTemplate({ email, nonce, name }))
      return true
    },
    Signup: sendSignupMail,
    SignupByInvitation: sendSignupMail,
  },
}
