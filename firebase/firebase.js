import app from "firebase/app"
import firebaseConfig from "./config"
import "firebase/auth"
import "firebase/firestore"
import "firebase/storage"

class Firebase {
  constructor() {
    if (!app.apps.length) {
      app.initializeApp(firebaseConfig)
    }

    this.auth = app.auth()
    this.db = app.firestore()
    this.storage = app.storage()
    
    // Google Auth Provider
    this.googleProvider = new app.auth.GoogleAuthProvider()
  }

  // Sign up with email/password
  async signup(name, email, password) {
    const newUser = await this.auth.createUserWithEmailAndPassword(
      email,
      password
    )

    await newUser.user.updateProfile({
      displayName: name,
    })

    // Send email verification
    await newUser.user.sendEmailVerification()
    
    return newUser.user
  }

  // Resend verification email
  async resendVerificationEmail() {
    const user = this.auth.currentUser
    if (user && !user.emailVerified) {
      await user.sendEmailVerification()
      return true
    }
    return false
  }

  // Sign in with email/password
  async login(email, password) {
    const result = await this.auth.signInWithEmailAndPassword(email, password)
    
    // Check if email is verified (bypass in development for easier testing)
    const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost'
    if (!result.user.emailVerified && !isDev) {
      throw { code: 'auth/email-not-verified', message: 'Please verify your email before signing in.' }
    }
    
    return result
  }

  // Sign in with Google
  async loginWithGoogle() {
    const result = await this.auth.signInWithPopup(this.googleProvider)
    return result.user
  }

  // Sign out
  async signout() {
    await this.auth.signOut()
  }
}

const firebase = new Firebase()
export default firebase
