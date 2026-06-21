import { request } from './axiosClient'

const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:4000'

export const authApi = {
  register: ({ email, password }) =>
    request(AUTH_API_URL, '/auth/register', {
      method: 'POST',
      body: { email, password },
    }),

  login: ({ email, password }) =>
    request(AUTH_API_URL, '/auth/login', {
      method: 'POST',
      body: { email, password },
    }),
}
