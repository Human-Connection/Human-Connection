import fs from 'fs'
import path from 'path'

const readFile = (fileName) => fs.readFileSync(path.join(__dirname, fileName), 'utf-8')

export const signup = readFile('./signup.html')
export const passwordReset = readFile('./resetPassword.html')
export const wrongAccount = readFile('./wrongAccount.html')
export const emailVerification = readFile('./emailVerification.html')

export const layout = readFile('./layout.html')
