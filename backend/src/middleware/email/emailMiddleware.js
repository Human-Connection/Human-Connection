import CONFIG from '../../config'
import nodemailer from 'nodemailer'
import { htmlToText } from 'nodemailer-html-to-text'
import {
  signupTemplate,
  resetPasswordTemplate,
  sendPasswordTemplate,
  wrongAccountTemplate,
  wrongEmailTemplate,
  emailVerificationTemplate,
} from './templateBuilder'

const hasEmailConfig = CONFIG.SMTP_HOST && CONFIG.SMTP_PORT
const hasAuthData = CONFIG.SMTP_USERNAME && CONFIG.SMTP_PASSWORD

let sendMail = () => {}
if (!hasEmailConfig) {
  if (process.env.NODE_ENV !== 'test') {
    // eslint-disable-next-line no-console
    console.log('Warning: Email middleware will not try to send mails.')
  }
} else {
  sendMail = async (templateArgs) => {
    const transporter = nodemailer.createTransport({
      host: CONFIG.SMTP_HOST,
      port: CONFIG.SMTP_PORT,
      ignoreTLS: CONFIG.SMTP_IGNORE_TLS === 'true',
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

const sendPasswordToMail = async (resolve, root, args, context, resolveInfo) => {
  const { email } = args
  const { email: userFound, nonce, name } = await resolve(root, args, context, resolveInfo)
  const template = userFound ? sendPasswordTemplate : wrongEmailTemplate
  await sendMail(template({ email, nonce, name }))
  return true
}

const sendEmailVerificationMail = async (resolve, root, args, context, resolveInfo) => {
  const response = await resolve(root, args, context, resolveInfo)
  const { email, nonce, name } = response
  await sendMail(emailVerificationTemplate({ email, nonce, name }))
  delete response.nonce
  return response
}

export default {
  Mutation: {
    AddEmailAddress: sendEmailVerificationMail,
    requestPasswordReset: sendPasswordResetMail,
    passwordReset: sendPasswordToMail,
    Signup: sendSignupMail,
    SignupByInvitation: sendSignupMail,
  },
}
