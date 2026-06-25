import { useState } from 'react'

import { getCurrentUser } from '../services/authService'

/**
 * Read the authenticated user once for the lifetime of the component.
 */
export const useCurrentUser = () => {
  const [user] = useState(() => getCurrentUser())
  return user
}
