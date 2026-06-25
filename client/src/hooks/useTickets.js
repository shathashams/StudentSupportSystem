import { useCallback, useEffect, useState } from 'react'

import { getTickets } from '../services/ticketService'

const sortByUpdatedDesc = (tickets) =>
  [...tickets].sort(
    (firstTicket, secondTicket) =>
      new Date(secondTicket.updatedAt) - new Date(firstTicket.updatedAt),
  )

/**
 * Load the ticket list for the current user.
 * The backend returns the student's own tickets or all tickets based on role.
 */
export const useTickets = () => {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const data = await getTickets()
      setTickets(sortByUpdatedDesc(data))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { tickets, loading, error, reload: load }
}
