import {
    getAuth,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    type User,
    type Unsubscribe,
} from 'firebase/auth'
import app from './index'

export const auth = getAuth(app)

// ─── Sign In ─────────────────────────────────────────────────────────────────

export const signIn = async (
    email: string,
    password: string
): Promise<User> => {
    const credential = await signInWithEmailAndPassword(auth, email, password)
    return credential.user
}

// ─── Sign Out ────────────────────────────────────────────────────────────────

export const signOut = async (): Promise<void> => {
    await firebaseSignOut(auth)
}

// ─── Auth State Listener ─────────────────────────────────────────────────────
// Returns the unsubscribe function — call it in a useEffect cleanup.

export const onAuthChange = (
    callback: (user: User | null) => void
): Unsubscribe => {
    return onAuthStateChanged(auth, callback)
}

// ─── Current User (synchronous snapshot) ────────────────────────────────────

export const currentUser = (): User | null => auth.currentUser