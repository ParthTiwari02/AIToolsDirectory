import { useState } from "react"
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

const WarningBox = styled.div`
  background-color: #fef3c7;
  border: 1px solid #fcd34d;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
`

const WarningText = styled.p`
  color: #92400e;
  margin: 0 0 0.5rem 0;
  font-size: 14px;
`

const ResendLink = styled.button`
  background: none;
  border: none;
  color: #92400e;
  text-decoration: underline;
  cursor: pointer;
  font-size: 14px;
  padding: 0;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const Login = () => {
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [needsVerification, setNeedsVerification] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)

  const { values, errors, handleSubmit, handleChange, handleBlur } =
    useValidation(initialState, loginValidation, logIn)

  const { password, email } = values

  const router = useRouter()

  async function logIn() {
    try {
      setLoading(true)
      setError("")
      setNeedsVerification(false)
      await firebase.login(email, password)
      router.push("/")
    } catch (error) {
      console.error(error.message)
      if (error.code === 'auth/email-not-verified') {
        setNeedsVerification(true)
        setError("")
      } else {
        setError("Oops! Invalid email or password. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResendVerification = async () => {
    try {
      setResendLoading(true)
      // Temporarily sign in to resend, then sign out
      const result = await firebase.auth.signInWithEmailAndPassword(email, password)
      await result.user.sendEmailVerification()
      await firebase.signout()
      setResendSuccess(true)
    } catch (error) {
      setError("Could not resend verification email.")
    } finally {
      setResendLoading(false)
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
          
          {needsVerification && (
            <WarningBox>
              <WarningText>
                📧 Please verify your email before signing in. Check your inbox for the verification link.
              </WarningText>
              {resendSuccess ? (
                <span style={{ color: '#166534', fontSize: '14px' }}>✓ Verification email sent!</span>
              ) : (
                <ResendLink onClick={handleResendVerification} disabled={resendLoading}>
                  {resendLoading ? 'Sending...' : 'Resend verification email'}
                </ResendLink>
              )}
            </WarningBox>
          )}
          
          {error && <Error>{error}</Error>}
          
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
