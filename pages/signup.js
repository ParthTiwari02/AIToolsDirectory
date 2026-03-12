import { useState } from "react"
import { useRouter } from "next/router"
import Link from 'next/link'
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

const Signup = () => {
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const { values, errors, handleSubmit, handleChange, handleBlur } =
    useValidation(initialState, signupValidation, signUp)

  const { name, password, email } = values
  const router = useRouter()

  async function signUp() {
    try {
      setLoading(true)
      setError("")
      await firebase.signup(name, email, password)
      // Redirect to home after successful signup
      router.push("/")
    } catch (error) {
      console.error(error.message)
      if (error.code === 'auth/email-already-in-use') {
        setError("This email is already registered. Try signing in instead.")
      } else if (error.code === 'auth/weak-password') {
        setError("Password should be at least 6 characters.")
      } else if (error.code === 'auth/invalid-email') {
        setError("Please enter a valid email address.")
      } else {
        setError("Failed to create account. Please try again.")
      }
    } finally {
      setLoading(false)
    }
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
