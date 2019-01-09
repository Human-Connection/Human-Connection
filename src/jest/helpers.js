import { request } from 'graphql-request'

export const host = 'http://127.0.0.1:3123'

export async function login ({ email, password }) {
  const mutation = `
      mutation {
        login(email:"${email}", password:"${password}"){
          token
        }
      }`
  const data = await request(host, mutation)
  const { token } = data.login
  return token
}
