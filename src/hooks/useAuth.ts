import { useState, useEffect } from 'react'
import { onAuthChange } from '../firebase/auth'
import type { User } from 'firebase/auth'

interface AuthState {
    user: User | null
    loading: boolean
}

// Resolves Firebase's async auth state before the app renders.
// Returns loading=true until Firebase has confirmed the session either way.
const useAuth = (): AuthState => {
    const [state, setState] = useState<AuthState>({ user: null, loading: true })

    useEffect(() => {
        const unsub = onAuthChange(user =>
            setState({ user, loading: false })
        )
        return unsub
    }, [])

    return state
}

export default useAuth