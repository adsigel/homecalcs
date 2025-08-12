import { initializeApp } from 'firebase/app'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { 
  getAuth, 
  connectAuthEmulator, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyAYQ1RSLm1S64b9JJWVSHgPKOakNjjmMFY",
  authDomain: "homecalcs-246.firebaseapp.com",
  projectId: "homecalcs-246",
  storageBucket: "homecalcs-246.firebasestorage.app",
  messagingSenderId: "1077682353104",
  appId: "1:1077682353104:web:f4b1525d7c067e47c7ffd5",
  measurementId: "G-SG0MXERM7Y"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firestore
export const db = getFirestore(app)

// Initialize Auth
export const auth = getAuth(app)

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider()

// Enable emulators in development
if (process.env.NODE_ENV === 'development') {
  // Uncomment these lines if you want to use Firebase emulators for local development
  // connectFirestoreEmulator(db, 'localhost', 8080)
  // connectAuthEmulator(auth, 'http://localhost:9099')
}

// Google Sign-In
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    return result.user
  } catch (error) {
    console.error('Error signing in with Google:', error)
    throw error
  }
}

// Sign Out
export const signOutUser = async () => {
  try {
    await signOut(auth)
  } catch (error) {
    console.error('Error signing out:', error)
    throw error
  }
}

// Get current user
export const getCurrentUser = (): User | null => {
  return auth.currentUser
}

// Get current user ID
export const getCurrentUserId = (): string | null => {
  return auth.currentUser?.uid || null
}

// Auth state listener
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback)
}
