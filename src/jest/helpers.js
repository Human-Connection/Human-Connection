import { request } from 'graphql-request'
import fetch from 'node-fetch'

export const host = 'http://127.0.0.1:3123'

export async function authenticatedHeaders ({ email, password }) {
  const mutation = `
      mutation {
        login(email:"${email}", password:"${password}"){
          token
        }
      }`
  const response = await request(host, mutation)
  const { token } = response.login
  if (!token) throw new Error(`Could not get a JWT token from the backend:\n${response}`)
  return {
    authorization: `Bearer ${token}`
  }
}

export async function queryServer ({ headers, query, variables }) {
  const defaultHeaders = {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
  const response = await fetch(host, {
    method: 'POST',
    authenticatedHeaders,
    headers: Object.assign({}, defaultHeaders, headers),
    body: JSON.stringify({
      operationName: null,
      query,
      variables
    })
  })
  const json = await response.json()
  return json.data
}
