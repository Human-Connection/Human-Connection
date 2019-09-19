import CONFIG from '../../config'
import nodemailer from 'nodemailer'
import { htmlToText } from 'nodemailer-html-to-text'
import {
  signupTemplate,
  resetPasswordTemplate,
  wrongAccountTemplate,
} from './templates/templateBuilder'

const hasEmailConfig = CONFIG.SMTP_HOST && CONFIG.SMTP_PORT
const hasAuthData = CONFIG.SMTP_USERNAME && CONFIG.SMTP_PASSWORD

let sendMail = () => {}
if (!hasEmailConfig) {
  if (process.env.NODE_ENV !== 'test') {
    // eslint-disable-next-line no-console
    console.log('Warning: Email middleware will not try to send mails.')
  }
} else {
  sendMail = async templateArgs => {
    const transporter = nodemailer.createTransport({
      host: CONFIG.SMTP_HOST,
      port: CONFIG.SMTP_PORT,
      ignoreTLS: CONFIG.SMTP_IGNORE_TLS,
      secure: false, // true for 465, false for other ports
      auth: hasAuthData && {
        user: CONFIG.SMTP_USERNAME,
        pass: CONFIG.SMTP_PASSWORD,
      },
    })

    transporter.use(
      'compile',
      htmlToText({
        ignoreImage: true,
        wordwrap: false,
      }),
    )

    await transporter.sendMail(templateArgs)
  }
}

const sendSignupMail = async (resolve, root, args, context, resolveInfo) => {
  const response = await resolve(root, args, context, resolveInfo)
  const { email, nonce } = response
  await sendMail(signupTemplate({ email, nonce }))
  delete response.nonce
  return response
}

const sendPasswordResetMail = async (resolve, root, args, context, resolveInfo) => {
  const { email } = args
  const { email: userFound, nonce, name } = await resolve(root, args, context, resolveInfo)
  const template = userFound ? resetPasswordTemplate : wrongAccountTemplate
  await sendMail(template({ email, nonce, name }))
  return true
}

export default {
  Mutation: {
    requestPasswordReset: sendPasswordResetMail,
    Signup: sendSignupMail,
    SignupByInvitation: sendSignupMail,
  },
}
