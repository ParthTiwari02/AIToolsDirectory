import { useState, useContext } from "react"
import { useRouter } from "next/router"
import styled from "@emotion/styled"
import FileUploader from "react-firebase-file-uploader"

import Layout from "@components/Layout/Layout"
import { FirebaseContext } from "../firebase/index"
import { CATEGORIES, generateSlug } from "../utils/categories"
import useValidation from "../hooks/useValidation"
import aiToolValidation from "../validation/aiToolValidation"

const Container = styled.div`
  max-width: 700px;
  margin: 0 auto;
  padding: 2rem;
`

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #21293c;
  text-align: center;
  margin-bottom: 0.5rem;
`

const Subtitle = styled.p`
  color: #667190;
  text-align: center;
  margin-bottom: 2rem;
`

const Form = styled.form`
  background-color: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 2rem;
`

const FormSection = styled.div`
  margin-bottom: 2rem;

  &:last-child {
    margin-bottom: 0;
  }
`

const SectionTitle = styled.h2`
  font-size: 1rem;
  font-weight: 600;
  color: #21293c;
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
`

const Field = styled.div`
  margin-bottom: 1.25rem;

  &:last-child {
    margin-bottom: 0;
  }
`

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #4b587c;
  margin-bottom: 0.5rem;
`

const Required = styled.span`
  color: var(--orange);
`

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--orange);
  }

  &::placeholder {
    color: #9ca3af;
  }
`

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  min-height: 120px;
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--orange);
  }

  &::placeholder {
    color: #9ca3af;
  }
`

const Select = styled.select`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  background-color: #fff;
  cursor: pointer;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--orange);
  }
`

const HelpText = styled.p`
  font-size: 12px;
  color: #9ca3af;
  margin: 0.5rem 0 0 0;
`

const Error = styled.p`
  font-size: 13px;
  color: #ef4444;
  margin: 0.5rem 0 0 0;
`

const LogoPreview = styled.div`
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
`

const LogoImage = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 12px;
  object-fit: cover;
  border: 1px solid #e5e7eb;
`

const UploadProgress = styled.div`
  font-size: 13px;
  color: #667190;
`

const SubmitButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #ff6154 0%, #ff9a8b 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 97, 84, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const LoginMessage = styled.div`
  text-align: center;
  padding: 3rem;
  background-color: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
`

const LoginLink = styled.a`
  color: var(--orange);
  cursor: pointer;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`

const initialState = {
  name: "",
  tagline: "",
  description: "",
  website_url: "",
  category: "",
  tags: "",
  submitter_email: "",
}

export default function SubmitTool() {
  const router = useRouter()
  const { user, firebase } = useContext(FirebaseContext)

  const [logoUrl, setLogoUrl] = useState("")
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [submitError, setSubmitError] = useState("")

  const { values, errors, handleSubmit, handleChange, handleBlur } =
    useValidation(initialState, aiToolValidation, submitTool)

  const { name, tagline, description, website_url, category, tags, submitter_email } = values

  async function submitTool() {
    if (!user) {
      router.push("/signin")
      return
    }

    if (!logoUrl) {
      setSubmitError("Please upload a logo for your tool")
      return
    }

    try {
      const slug = generateSlug(name)
      
      // Check if slug already exists
      const existingTool = await firebase.db
        .collection("ai_tools")
        .where("slug", "==", slug)
        .get()

      if (!existingTool.empty) {
        setSubmitError("A tool with a similar name already exists. Please choose a different name.")
        return
      }

      const toolData = {
        name,
        tagline,
        description,
        website_url,
        logo_url: logoUrl,
        category,
        tags: tags.split(",").map(tag => tag.trim().toLowerCase()).filter(Boolean),
        submitter_email: submitter_email || user.email,
        upvotes: 0,
        featured: false,
        created_at: Date.now(),
        hasVoted: [],
        slug,
        submitter: {
          id: user.uid,
          name: user.displayName,
        },
      }

      await firebase.db.collection("ai_tools").add(toolData)
      router.push("/")
    } catch (error) {
      console.error("Error submitting tool:", error)
      setSubmitError("Failed to submit tool. Please try again.")
    }
  }

  const handleUploadStart = () => {
    setProgress(0)
    setUploading(true)
    setSubmitError("")
  }

  const handleProgress = (progress) => setProgress(progress)

  const handleUploadError = (error) => {
    setUploading(false)
    console.error(error)
    setSubmitError("Failed to upload logo. Please try again.")
  }

  const handleUploadSuccess = (filename) => {
    setProgress(100)
    setUploading(false)
    firebase.storage
      .ref("ai_tools")
      .child(filename)
      .getDownloadURL()
      .then(url => {
        setLogoUrl(url)
      })
  }

  if (!user) {
    return (
      <Layout
        title="Submit AI Tool"
        description="Submit your AI tool to get discovered by thousands of users looking for the best AI solutions."
      >
        <Container>
          <Title>🚀 Submit Your AI Tool</Title>
          <LoginMessage>
            <p>Please sign in to submit your AI tool.</p>
            <p>
              <LoginLink onClick={() => router.push("/signin")}>Sign in</LoginLink>
              {" "}or{" "}
              <LoginLink onClick={() => router.push("/signup")}>create an account</LoginLink>
            </p>
          </LoginMessage>
        </Container>
      </Layout>
    )
  }

  return (
    <Layout
      title="Submit AI Tool"
      description="Submit your AI tool to get discovered by thousands of users looking for the best AI solutions."
    >
      <Container>
        <Title>🚀 Submit Your AI Tool</Title>
        <Subtitle>Share your AI tool with the community</Subtitle>

        <Form onSubmit={handleSubmit} noValidate>
          <FormSection>
            <SectionTitle>Basic Information</SectionTitle>
            
            <Field>
              <Label htmlFor="name">
                Tool Name <Required>*</Required>
              </Label>
              <Input
                type="text"
                id="name"
                name="name"
                placeholder="e.g., ChatGPT, Midjourney, GitHub Copilot"
                value={name}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {errors.name && <Error>{errors.name}</Error>}
            </Field>

            <Field>
              <Label htmlFor="tagline">
                Tagline <Required>*</Required>
              </Label>
              <Input
                type="text"
                id="tagline"
                name="tagline"
                placeholder="e.g., AI-powered writing assistant"
                value={tagline}
                onChange={handleChange}
                onBlur={handleBlur}
                maxLength={100}
              />
              <HelpText>A short, catchy description (max 100 characters)</HelpText>
              {errors.tagline && <Error>{errors.tagline}</Error>}
            </Field>

            <Field>
              <Label htmlFor="description">
                Description <Required>*</Required>
              </Label>
              <TextArea
                id="description"
                name="description"
                placeholder="Describe what your tool does, its key features, and how it helps users..."
                value={description}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {errors.description && <Error>{errors.description}</Error>}
            </Field>

            <Field>
              <Label htmlFor="website_url">
                Website URL <Required>*</Required>
              </Label>
              <Input
                type="url"
                id="website_url"
                name="website_url"
                placeholder="https://your-tool.com"
                value={website_url}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {errors.website_url && <Error>{errors.website_url}</Error>}
            </Field>
          </FormSection>

          <FormSection>
            <SectionTitle>Categorization</SectionTitle>

            <Field>
              <Label htmlFor="category">
                Category <Required>*</Required>
              </Label>
              <Select
                id="category"
                name="category"
                value={category}
                onChange={handleChange}
                onBlur={handleBlur}
              >
                <option value="">Select a category</option>
                {CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </Select>
              {errors.category && <Error>{errors.category}</Error>}
            </Field>

            <Field>
              <Label htmlFor="tags">Tags</Label>
              <Input
                type="text"
                id="tags"
                name="tags"
                placeholder="e.g., gpt, chatbot, automation"
                value={tags}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <HelpText>Comma-separated tags to help users find your tool</HelpText>
              {errors.tags && <Error>{errors.tags}</Error>}
            </Field>
          </FormSection>

          <FormSection>
            <SectionTitle>Media & Contact</SectionTitle>

            <Field>
              <Label>
                Logo <Required>*</Required>
              </Label>
              <FileUploader
                accept="image/*"
                randomizeFilename
                storageRef={firebase.storage.ref("ai_tools")}
                onUploadStart={handleUploadStart}
                onUploadError={handleUploadError}
                onUploadSuccess={handleUploadSuccess}
                onProgress={handleProgress}
              />
              <HelpText>Upload a square logo (recommended: 200x200px)</HelpText>
              {uploading && (
                <UploadProgress>Uploading... {progress}%</UploadProgress>
              )}
              {logoUrl && (
                <LogoPreview>
                  <LogoImage src={logoUrl} alt="Logo preview" />
                  <span>Logo uploaded successfully!</span>
                </LogoPreview>
              )}
            </Field>

            <Field>
              <Label htmlFor="submitter_email">Contact Email</Label>
              <Input
                type="email"
                id="submitter_email"
                name="submitter_email"
                placeholder={user.email || "your@email.com"}
                value={submitter_email}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <HelpText>We'll use this to contact you about your submission</HelpText>
              {errors.submitter_email && <Error>{errors.submitter_email}</Error>}
            </Field>
          </FormSection>

          {submitError && <Error style={{ marginBottom: "1rem" }}>{submitError}</Error>}

          <SubmitButton type="submit" disabled={uploading}>
            {uploading ? "Uploading..." : "Submit AI Tool"}
          </SubmitButton>
        </Form>
      </Container>
    </Layout>
  )
}
