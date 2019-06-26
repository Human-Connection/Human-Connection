import CONFIG from '../../config'
import nodemailer from 'nodemailer'
import { resetPasswordMail, wrongAccountMail } from './templates/passwordReset'
import { signupTemplate } from './templates/signup'

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

const returnResponse = async (resolve, root, args, context, resolveInfo) => {
  const { response } = await resolve(root, args, context, resolveInfo)
  delete response.nonce
  return response
}

const sendSignupMail = async (resolve, root, args, context, resolveInfo) => {
  const { email } = args
  const { response, nonce } = await resolve(root, args, context, resolveInfo)
  delete response.nonce
  await transporter().sendMail(signupTemplate({ email, nonce }))
  return response
}

export default function({ isEnabled }) {
  if (!isEnabled)
    return {
      Mutation: {
        requestPasswordReset: returnResponse,
        CreateSignUp: returnResponse,
        CreateSignUpByInvitationCode: returnResponse,
      },
    }

  return {
    Mutation: {
      requestPasswordReset: async (resolve, root, args, context, resolveInfo) => {
        const { email } = args
        const { response, user, code, name } = await resolve(root, args, context, resolveInfo)
        const mailTemplate = user ? resetPasswordMail : wrongAccountMail
        await transporter().sendMail(mailTemplate({ email, code, name }))
        return response
      },
      CreateSignUp: sendSignupMail,
      CreateSignUpByInvitationCode: sendSignupMail,
    },
  }
}
