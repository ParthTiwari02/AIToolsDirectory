import { useState } from "react"
import { useRouter } from "next/router"
import Link from 'next/link'
import { css } from "@emotion/core"
import styled from "@emotion/styled"

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
  background: linear-gradient(135deg, #dcfce7 0%, #d1fae5 100%);
  border: 1px solid #86efac;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  margin: 2rem 0;
`

const SuccessIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`

const SuccessTitle = styled.h2`
  color: #166534;
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
`

const SuccessText = styled.p`
  color: #15803d;
  margin: 0 0 1rem 0;
  line-height: 1.6;
`

const EmailHighlight = styled.span`
  font-weight: 600;
  color: #166534;
`

const SignInLink = styled.a`
  display: inline-block;
  padding: 0.75rem 2rem;
  background: linear-gradient(135deg, #ff6154 0%, #ff8c42 100%);
  color: white;
  font-weight: 600;
  text-decoration: none;
  border-radius: 8px;
  margin-top: 1rem;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(255, 97, 84, 0.3);
  }
`

const Signup = () => {
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [signupSuccess, setSignupSuccess] = useState(false)
  const [userEmail, setUserEmail] = useState("")

  const { values, errors, handleSubmit, handleChange, handleBlur } =
    useValidation(initialState, signupValidation, signUp)

  const { name, password, email } = values
  const router = useRouter()

  async function signUp() {
    try {
      setLoading(true)
      setError("")
      await firebase.signup(name, email, password)
      setUserEmail(email)
      setSignupSuccess(true)
      // Sign out after signup so they have to verify first
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

  if (signupSuccess) {
    return (
      <Layout title="Verify Your Email">
        <div css={css`max-width: 500px; margin: 0 auto; padding: 2rem;`}>
          <SuccessBox>
            <SuccessIcon>📧</SuccessIcon>
            <SuccessTitle>Check Your Email!</SuccessTitle>
            <SuccessText>
              We've sent a verification link to<br />
              <EmailHighlight>{userEmail}</EmailHighlight>
            </SuccessText>
            <SuccessText css={css`font-size: 0.9rem; color: #22c55e;`}>
              Click the link in the email to verify your account, then come back to sign in.
            </SuccessText>
            <Link href="/signin" legacyBehavior>
              <SignInLink>Go to Sign In</SignInLink>
            </Link>
          </SuccessBox>
          <p css={css`text-align: center; color: #667190; font-size: 0.875rem;`}>
            Didn't receive the email? Check your spam folder or{" "}
            <Link href="/signup" css={css`color: var(--orange);`}>try again</Link>
          </p>
        </div>
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
