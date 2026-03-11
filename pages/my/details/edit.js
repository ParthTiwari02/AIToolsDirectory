import { useContext, useEffect, useRef, useState } from "react"
import { useRouter } from "next/router"
import styled from "@emotion/styled"

import FirebaseContext from "../../../firebase/context"
import Layout from "@components/Layout/Layout"
import firebase from "../../../firebase/index"

const Container = styled.article`
  padding: 2rem 3rem;
  max-width: 900px;
  margin: 0 auto;

  @media (max-width: 1100px) {
    max-width: unset;
  }
`

const HeadingContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const H1 = styled.h1`
  margin: 0;
  padding: 0;
  margin-bottom: 4px;
  color: #21293c;
  font-size: 24px;
  line-height: 32px;
  font-weight: 600;
`

const LogoutButton = styled.button`
  background-color: transparent;
  border: 1px solid #e5e7eb;
  color: #667190;
  font-size: 14px;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #ef4444;
    color: #ef4444;
    background-color: #fef2f2;
  }
`

const ImageUploadContainer = styled.div`
  display: flex;
  box-sizing: border-box;
  flex: 1;
`

const ImagePreviewContainer = styled.div`
  position: relative;

  img {
    vertical-align: bottom;
    border: none;
    border-radius: 4px;
    width: 80px;
    height: 80px;
  }
`

const FileUploadActions = styled.div`
  display: flex;
  box-sizing: border-box;
  flex-direction: column;
  margin-left: 16px;
`

const FileUploadButton = styled.button`
  font: inherit;
  margin: 0;
  overflow: visible;
  text-transform: none;
  cursor: pointer;
  appearance: none;
  outline: none;
  border-radius: 4px;
  position: relative;
  display: inline-block;
  transition: all 0.3s ease;
  text-align: center;
  font-size: 14px;
  line-height: 24px;
  font-weight: 600;
  padding: 8px 16px;
  border: 1px solid #d9e1ec;
  background: #fff;
  color: #21293c;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const FileUploadHelper = styled.p`
  color: #4b587c;
  margin-top: 20px;
  font-size: 12px;
  line-height: 20px;
  font-weight: 400;
`

const FileInput = styled.input`
  display: none;
`

const MainUserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`

const Form = styled.form`
  gap: 1.5rem;
  display: grid;
`

const InputContainer = styled.div``

const Label = styled.label`
  color: #21293c;
  font-size: 14px;
  line-height: 24px;
  font-weight: 600;
`

const Input = styled.input`
  font: inherit;
  margin: 0;
  padding-top: 8px;
  padding-bottom: 8px;
  padding-left: 12px;
  padding-right: 12px;
  color: #21293c;
  font-size: 14px;
  line-height: 24px;
  outline: none;
  border: 1px solid #d9e1ec;
  border-radius: 4px;
  height: 40px;
  box-sizing: border-box;
  width: 100%;
  background-color: #fff;
`

const Submit = styled.button`
  font: inherit;
  margin: 0;
  overflow: visible;
  text-transform: none;
  cursor: pointer;
  appearance: none;
  outline: none;
  border: 1px solid transparent;
  position: relative;
  display: inline-block;
  transition: all 0.3s ease;
  text-align: center;
  font-size: 14px;
  line-height: 24px;
  font-weight: 600;
  padding: 8px 16px;
  background: #ff6154;
  border-radius: 4px;
  color: #fff;
  width: max-content;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const ErrorMessage = styled.p`
  color: #dc2626;
  font-size: 13px;
  margin: 4px 0 0 0;
`

const SuccessMessage = styled.div`
  background-color: #f0fdf4;
  border: 1px solid #86efac;
  border-radius: 8px;
  padding: 12px 16px;
  color: #166534;
  font-size: 14px;
  margin-bottom: 1rem;
`

const InputHelper = styled.p`
  color: #667190;
  font-size: 12px;
  margin: 4px 0 0 0;
`

export default function Edit() {
  const { user } = useContext(FirebaseContext)
  const router = useRouter()

  const [formValues, setFormValues] = useState({
    name: "",
    username: "",
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    if (user) {
      setFormValues(prev => ({
        ...prev,
        name: user.displayName || "",
        username: user.displayName?.toLowerCase().replace(/\s+/g, '') || "",
      }))
    }
  }, [user])

  const [newPictureUrl, setNewPictureUrl] = useState(null)
  const [loadingPicture, setLoadingPicture] = useState(false)

  const fileInputRef = useRef(null)

  const handleUploadButtonClick = () => {
    fileInputRef.current.click()
  }

  function handleNewPictureUpload(event) {
    const file = event.target.files[0]

    if (file) {
      setLoadingPicture(true)
      const storageRef = firebase.storage.ref()
      const fileRef = storageRef.child(`avatars/${user.uid}/${file.name}`)

      fileRef.put(file).then(() => {
        fileRef
          .getDownloadURL()
          .then(url => {
            setNewPictureUrl(url)

            user.updateProfile({
              photoURL: url,
            })
          })
          .finally(() => setLoadingPicture(false))
      })
    }
  }

  // Check if username is taken by another user
  async function isUsernameTaken(username) {
    const snapshot = await firebase.db
      .collection("users")
      .where("username", "==", username.toLowerCase())
      .get()
    
    // Check if any returned user is different from current user
    let taken = false
    snapshot.forEach(doc => {
      if (doc.id !== user.uid) {
        taken = true
      }
    })
    return taken
  }

  async function handleFormSubmit(event) {
    event.preventDefault()
    setError("")
    setSuccess("")

    const { name, username } = formValues

    // Validate
    if (!name.trim()) {
      setError("Name is required")
      return
    }

    if (!username.trim()) {
      setError("Username is required")
      return
    }

    // Username format check (alphanumeric and underscores only)
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError("Username can only contain letters, numbers, and underscores")
      return
    }

    if (username.length < 3) {
      setError("Username must be at least 3 characters")
      return
    }

    setSaving(true)

    try {
      // Check if username is taken
      const taken = await isUsernameTaken(username)
      if (taken) {
        setError("This username is already taken. Please choose another.")
        setSaving(false)
        return
      }

      // Update Firebase Auth profile
      await user.updateProfile({
        displayName: name,
      })

      // Save/update user document in Firestore
      await firebase.db.collection("users").doc(user.uid).set({
        username: username.toLowerCase(),
        displayName: name,
        email: user.email,
        updatedAt: Date.now(),
      }, { merge: true })

      setSuccess("Profile saved successfully!")
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      console.error(err)
      setError("Failed to save profile. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  function handleInputChange(event) {
    const { name, value } = event.target
    setFormValues(prev => ({
      ...prev,
      [name]: name === "username" ? value.toLowerCase().replace(/\s+/g, '') : value,
    }))
  }

  async function handleLogout() {
    try {
      await firebase.signout()
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <Layout title="My Details">
      <Container>
        <MainUserInfo>
          <HeadingContainer>
            <H1>My details</H1>
            <LogoutButton onClick={handleLogout}>Sign out</LogoutButton>
          </HeadingContainer>
          
          {success && <SuccessMessage>✓ {success}</SuccessMessage>}
          
          <ImageUploadContainer>
            <ImagePreviewContainer>
              <img
                loading="lazy"
                src={newPictureUrl ?? user?.photoURL ?? "/product-hunt.svg"}
                alt={user?.displayName}
              />
            </ImagePreviewContainer>
            <FileUploadActions>
              <FileUploadButton
                onClick={handleUploadButtonClick}
                disabled={loadingPicture}
              >
                {loadingPicture ? "Uploading..." : "Upload new avatar"}
              </FileUploadButton>
              <FileUploadHelper>
                Recommended size: 400x400px · Picture is automatically saved
              </FileUploadHelper>
            </FileUploadActions>
            <FileInput
              type="file"
              name="avatar"
              accept="image/gif, image/jpeg, image/png, image/webp"
              onChange={handleNewPictureUpload}
              ref={fileInputRef}
            />
          </ImageUploadContainer>
          <Form onSubmit={handleFormSubmit}>
            <InputContainer>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                name="name"
                value={formValues.name}
                onChange={handleInputChange}
                placeholder="Your display name"
              />
            </InputContainer>
            <InputContainer>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                name="username"
                value={formValues.username}
                onChange={handleInputChange}
                placeholder="yourname"
              />
              <InputHelper>Username must be unique. Letters, numbers, and underscores only.</InputHelper>
              {error && <ErrorMessage>{error}</ErrorMessage>}
            </InputContainer>
            <Submit type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Submit>
          </Form>
        </MainUserInfo>
      </Container>
    </Layout>
  );
}
