import app from "firebase/app"
import firebaseConfig from "./config"
import "firebase/auth"
import "firebase/firestore"
import "firebase/storage"

class Firebase {
  constructor() {
    // Only initialize on client side
    if (typeof window !== 'undefined') {
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
    } else {
      // Server-side: create dummy objects to prevent errors
      this.auth = null
      this.db = null
      this.storage = null
      this.googleProvider = null
    }
  }

  // Sign up with email/password
  async signup(name, email, password) {
    if (!this.auth) return null
    try {
      const newUser = await this.auth.createUserWithEmailAndPassword(
        email,
        password
      )

      await newUser.user.updateProfile({
        displayName: name,
      })

      return newUser.user
    } catch (error) {
      console.error('Signup error:', error)
      throw error
    }
  }

  // Sign in with email/password
  async login(email, password) {
    if (!this.auth) return null
    const result = await this.auth.signInWithEmailAndPassword(email, password)
    return result
  }

  // Sign in with Google
  async loginWithGoogle() {
    if (!this.auth || !this.googleProvider) {
      throw new Error('Firebase not initialized')
    }
    try {
      const result = await this.auth.signInWithPopup(this.googleProvider)
      return result.user
    } catch (error) {
      console.error('Google sign-in error:', error)
      // If popup blocked or closed, try redirect
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
        await this.auth.signInWithRedirect(this.googleProvider)
        return null
      }
      throw error
    }
  }

  // Handle redirect result (call on page load)
  async getRedirectResult() {
    if (!this.auth) return null
    try {
      const result = await this.auth.getRedirectResult()
      if (result && result.user) {
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
    if (!this.auth) return
    await this.auth.signOut()
  }
}

const firebase = new Firebase()
export default firebase
