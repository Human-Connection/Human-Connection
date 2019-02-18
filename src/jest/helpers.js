import { request } from 'graphql-request'

export const testServerHost = 'http://127.0.0.1:4123'

export async function authenticatedHeaders ({ email, password }, host = testServerHost) {
  const mutation = `
      mutation {
        login(email:"${email}", password:"${password}"){
          token
        }
      }`
  const response = await request(host, mutation)
  return {
    authorization: `Bearer ${response.login.token}`
  }
}
