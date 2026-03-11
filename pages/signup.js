import { useState } from "react"
import { useRouter } from "next/router"
import Link from 'next/link'
import styled from "@emotion/styled"
import { css } from "@emotion/core"

import Layout from "../components/Layout/Layout"
import useValidation from "../hooks/useValidation"
import signupValidation from "../validation/signupValidation"
import { Form, Field, InputSubmit, Error } from "../components/UI/Form"
import firebase from "../firebase/index"

const initialState = {
  name: "",
  password: "",
  email: "",
}

const SuccessBox = styled.div`
  background-color: #f0fdf4;
  border: 1px solid #86efac;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
  margin-top: 2rem;
`

const SuccessIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`

const SuccessTitle = styled.h2`
  color: #166534;
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
`

const SuccessText = styled.p`
  color: #15803d;
  margin: 0 0 1rem 0;
`

const ResendButton = styled.button`
  background: none;
  border: none;
  color: #166534;
  text-decoration: underline;
  cursor: pointer;
  font-size: 14px;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const Signup = () => {
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [signupComplete, setSignupComplete] = useState(false)
  const [signupEmail, setSignupEmail] = useState("")
  const [resendLoading, setResendLoading] = useState(false)
  const [resendMessage, setResendMessage] = useState("")

  const { values, errors, handleSubmit, handleChange, handleBlur } =
    useValidation(initialState, signupValidation, signUp)

  const { name, password, email } = values
  const router = useRouter()

  async function signUp() {
    try {
      setLoading(true)
      setError("")
      await firebase.signup(name, email, password)
      setSignupEmail(email)
      setSignupComplete(true)
      // Sign out immediately so user has to verify email first
      await firebase.signout()
    } catch (error) {
      console.error(error.message)
      if (error.code === 'auth/email-already-in-use') {
        setError("This email is already registered. Try signing in instead.")
      } else if (error.code === 'auth/weak-password') {
        setError("Password should be at least 6 characters.")
      } else {
        setError("Failed to create account. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResendEmail = async () => {
    try {
      setResendLoading(true)
      // Sign in temporarily to resend
      await firebase.auth.signInWithEmailAndPassword(signupEmail, values.password)
      await firebase.resendVerificationEmail()
      await firebase.signout()
      setResendMessage("Verification email sent!")
    } catch (error) {
      setResendMessage("Could not resend. Try signing in.")
    } finally {
      setResendLoading(false)
    }
  }

  if (signupComplete) {
    return (
      <Layout title="Verify Your Email">
        <SuccessBox>
          <SuccessIcon>📧</SuccessIcon>
          <SuccessTitle>Check Your Email!</SuccessTitle>
          <SuccessText>
            We've sent a verification link to <strong>{signupEmail}</strong>.<br />
            Please click the link to verify your account.
          </SuccessText>
          {resendMessage && <p style={{ color: '#166534', fontSize: '14px' }}>{resendMessage}</p>}
          <ResendButton onClick={handleResendEmail} disabled={resendLoading}>
            {resendLoading ? 'Sending...' : "Didn't receive it? Resend email"}
          </ResendButton>
          <div style={{ marginTop: '1.5rem' }}>
            <Link href="/signin" style={{ color: 'var(--orange)', fontWeight: 600 }}>
              Go to Sign In →
            </Link>
          </div>
        </SuccessBox>
      </Layout>
    )
  }

  return (
    <div>
      <Layout title="Sign Up">
        <Form onSubmit={handleSubmit} noValidate>
          <h1
            css={css`
              margin-top: 2rem;
              margin-bottom: 0;
            `}
          >
            Sign Up
          </h1>
          <p css={css`color: #667190; margin-top: 0.5rem;`}>
            Create an account to submit and upvote AI tools
          </p>
          
          {error && <Error>{error}</Error>}
          
          <Field>
            <label htmlFor="name">Name</label>
            <input
              data-error={errors.name !== undefined}
              type="text"
              id="name"
              placeholder="Your name"
              name="name"
              value={name}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {errors.name && <Error>{errors.name}</Error>}
          </Field>
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
              placeholder="At least 6 characters"
              name="password"
              value={password}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {errors.password && <Error>{errors.password}</Error>}
          </Field>
          <InputSubmit type="submit" value={loading ? "Creating account..." : "Sign Up"} disabled={loading} />
          <Link
            css={css`
            color: var(--orange);
            text-align: center;
            margin-top: 5px;
            `}
            href="/signin">
            Already have an account? Sign In
          </Link>
        </Form>
      </Layout>
    </div>
  )
}

export default Signup
