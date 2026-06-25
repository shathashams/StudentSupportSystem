import { useEffect, useState } from 'react'

import { getTicketById } from '../services/ticketService'

/**
 * Load a single ticket (including its comments) by id.
 */
export const useTicket = (ticketId) => {
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    setLoading(true)
    setError('')

    getTicketById(ticketId)
      .then((data) => {
        if (isMounted) {
          setTicket(data)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message)
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [ticketId])

  return { ticket, setTicket, loading, error }
}
