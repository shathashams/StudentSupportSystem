import api from './api'

/**
 * Log in the user by sending email, password, and selected role to the backend.
 * Saves the received JWT token and user info to localStorage on success.
 */
export const login = async ({ email, password, role }) => {
  try {
    const response = await api.post('/auth/login', { email, password, role })
    const { token, user } = response.data

    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))

    return user
  } catch (error) {
    // Extract server error message if available, otherwise fallback
    const errorMessage =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      'An error occurred during login. Please try again.'
    throw new Error(errorMessage)
  }
}

/**
 * Register a new student user.
 */
export const register = async ({ name, email, password, confirmPassword }) => {
  try {
    const response = await api.post('/auth/register', {
      name,
      email,
      password,
      confirmPassword,
    })
    return response.data
  } catch (error) {
    const errorMessage =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      'An error occurred during registration. Please try again.'
    throw new Error(errorMessage)
  }
}

/**
 * Log out the user by clearing their stored credentials.
 */
export const logout = () => {
  localStorage.removeItem('user')
  localStorage.removeItem('token')
}

/**
 * Get the current authenticated user's profile from localStorage.
 */
export const getCurrentUser = () => {
  const storedUser = localStorage.getItem('user')

  if (!storedUser) {
    return null
  }

  try {
    return JSON.parse(storedUser)
  } catch {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    return null
  }
}