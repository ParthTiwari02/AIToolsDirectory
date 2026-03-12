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
    this.googleProvider.setCustomParameters({
      prompt: 'select_account'
    })
  }

  // Sign up with email/password
  async signup(name, email, password) {
    try {
      const newUser = await this.auth.createUserWithEmailAndPassword(
        email,
        password
      )

      await newUser.user.updateProfile({
        displayName: name,
      })

      // Try to send verification email, but don't fail if it doesn't work
      try {
        await newUser.user.sendEmailVerification({
          url: typeof window !== 'undefined' ? window.location.origin + '/signin' : 'https://launchaijam.com/signin',
          handleCodeInApp: false
        })
      } catch (emailError) {
        console.warn('Could not send verification email:', emailError)
      }

      return newUser.user
    } catch (error) {
      console.error('Signup error:', error)
      throw error
    }
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

  // Sign in with email/password - simplified without verification requirement
  async login(email, password) {
    const result = await this.auth.signInWithEmailAndPassword(email, password)
    return result
  }

  // Sign in with Google
  async loginWithGoogle() {
    try {
      // Try popup first
      const result = await this.auth.signInWithPopup(this.googleProvider)
      return result.user
    } catch (error) {
      // If popup blocked, try redirect
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
        console.log('Popup blocked, trying redirect...')
        await this.auth.signInWithRedirect(this.googleProvider)
        return null
      }
      throw error
    }
  }

  // Handle redirect result (call on page load)
  async getRedirectResult() {
    try {
      const result = await this.auth.getRedirectResult()
      if (result.user) {
        return result.user
      }
      return null
    } catch (error) {
      console.error('Redirect result error:', error)
      return null
    }
  }

  // Sign out
  async signout() {
    await this.auth.signOut()
  }
}

const firebase = new Firebase()
export default firebase
