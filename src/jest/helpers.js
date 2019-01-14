import { request } from 'graphql-request'
import { GraphQLClient } from 'graphql-request'

export const host = 'http://127.0.0.1:3123'

export async function getJWT({ email, password }) {
  const mutation = `
      mutation {
        login(email:"${email}", password:"${password}"){
          token
        }
      }`
  const response = await request(host, mutation)
  const { token } = response.login
  if(!token) throw `Could not get a JWT token from the backend:\n${response}`
  return token
}

export async function authenticatedGraphQLClient(params){
  const jwt = await getJWT(params)
  const options = {
    headers: {
      'Authorization': `Bearer ${jwt}`
    }
  }
  return new GraphQLClient(host, options)
}
