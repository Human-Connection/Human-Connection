import { request } from 'graphql-request'

// this is the to-be-tested server host
// not to be confused with the seeder host
export const host = 'http://127.0.0.1:4123'

export async function login(variables) {
  const mutation = `
    mutation($email: String!, $password: String!) {
      login(email: $email, password: $password)
    }
  `
  const response = await request(host, mutation, variables)
  return {
    authorization: `Bearer ${response.login}`,
  }
}
