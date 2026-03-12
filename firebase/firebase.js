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
    await newUser.user.sendEmailVerification({
      url: typeof window !== 'undefined' ? window.location.origin + '/signin' : 'https://launchaijam.com/signin',
      handleCodeInApp: false
    })

    return newUser.user
  }

  // Resend verification email
  async resendVerificationEmail() {
    const user = this.auth.currentUser
    if (user && !user.emailVerified) {
      await user.sendEmailVerification({
        url: typeof window !== 'undefined' ? window.location.origin + '/signin' : 'https://launchaijam.com/signin',
        handleCodeInApp: false
      })
      return true
    }
    return false
  }

  // Check if current user's email is verified
  isEmailVerified() {
    const user = this.auth.currentUser
    return user ? user.emailVerified : false
  }

  // Sign in with email/password
  async login(email, password) {
    const result = await this.auth.signInWithEmailAndPassword(email, password)
    
    // Check if email is verified
    if (!result.user.emailVerified) {
      // Sign out unverified user
      await this.auth.signOut()
      const error = new Error('Please verify your email before signing in. Check your inbox for the verification link.')
      error.code = 'auth/email-not-verified'
      error.user = result.user
      throw error
    }
    
    return result
  }

  // Sign in with Google (no verification needed - Google already verified)
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
