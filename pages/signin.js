import { useState, useEffect } from "react"
import Layout from "../components/Layout/Layout"
import useValidation from "../hooks/useValidation"
import loginValidation from "../validation/loginValidation"
import { useRouter } from "next/router"
import Link from 'next/link'
import styled from "@emotion/styled"
import { Form, Field, InputSubmit, Error } from "@components/UI/Form"
import { css } from "@emotion/core"
import firebase from "../firebase/index"

const initialState = {
  password: "",
  email: "",
}

const GoogleButton = styled.button`
  width: 100%;
  padding: 0.75rem 1rem;
  background: white;
  color: #333;
  font-weight: 600;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #f9fafb;
    border-color: #d1d5db;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 1.5rem 0;
  color: #9ca3af;
  font-size: 0.875rem;

  &::before,
  &::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid #e5e7eb;
  }

  span {
    padding: 0 1rem;
  }
`

const Login = () => {
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const { values, errors, handleSubmit, handleChange, handleBlur } =
    useValidation(initialState, loginValidation, logIn)

  const { password, email } = values

  const router = useRouter()

  // Check for redirect result on page load (for Google sign-in fallback)
  useEffect(() => {
    const checkRedirect = async () => {
      try {
        const user = await firebase.getRedirectResult()
        if (user) {
          router.push("/")
        }
      } catch (err) {
        console.error('Redirect check error:', err)
      }
    }
    checkRedirect()
  }, [router])

  async function logIn() {
    try {
      setLoading(true)
      setError("")
      await firebase.login(email, password)
      router.push("/")
    } catch (error) {
      console.error(error.message)
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setError("Invalid email or password. Please try again.")
      } else if (error.code === 'auth/invalid-email') {
        setError("Please enter a valid email address.")
      } else {
        setError("Failed to sign in. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleSignIn() {
    try {
      setLoading(true)
      setError("")
      const user = await firebase.loginWithGoogle()
      if (user) {
        router.push("/")
      }
      // If null, redirect is happening
    } catch (error) {
      console.error('Google sign-in error:', error)
      if (error.code === 'auth/popup-closed-by-user') {
        setError("Sign-in was cancelled. Please try again.")
      } else if (error.code === 'auth/unauthorized-domain') {
        setError("This domain is not authorized. Please contact support.")
      } else if (error.code === 'auth/operation-not-allowed') {
        setError("Google sign-in is not enabled. Please use email/password.")
      } else {
        setError("Failed to sign in with Google. Please try email/password instead.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Layout title="Sign In">
        <Form onSubmit={handleSubmit} noValidate>
          <h1
            css={css`
              margin-top: 2rem;
              margin-bottom: 0;
            `}
          >
            Sign In
          </h1>
          <p css={css`color: #667190; margin-top: 0.5rem;`}>
            Sign in to submit and upvote AI tools
          </p>
          
          {error && <Error>{error}</Error>}

          <GoogleButton type="button" onClick={handleGoogleSignIn} disabled={loading}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </GoogleButton>

          <Divider><span>or</span></Divider>
          
          <Field>
            <label htmlFor="email">Email</label>
            <input
              data-error={errors.email !== undefined}
              type="email"
              id="email"
              name="email"
              placeholder="you@example.com"
              value={email}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {errors.email && <Error>{errors.email}</Error>}
          </Field>
          <Field>
            <label htmlFor="password">Password</label>
            <input
              data-error={errors.password !== undefined}
              type="password"
              id="password"
              placeholder="Your password"
              name="password"
              value={password}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {errors.password && <Error>{errors.password}</Error>}
          </Field>
          <InputSubmit type="submit" value={loading ? "Signing in..." : "Sign In"} disabled={loading} />
          <Link
            css={css`
            color: var(--orange);
            text-align: center;
            margin-top: 5px;
            `}
            href="/signup">
            Don't have an account? Sign Up
          </Link>
        </Form>
      </Layout>
    </div>
  )
}

export default Login
