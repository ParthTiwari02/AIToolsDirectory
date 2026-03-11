import { useState, useContext } from "react"
import { useRouter } from "next/router"
import styled from "@emotion/styled"
import Layout from "../../components/Layout/Layout"
import { FirebaseContext } from "../../firebase/index"
import { CATEGORIES } from "../../utils/categories"
import FileUploader from "react-firebase-file-uploader"

const Wrapper = styled.div`
  max-width: 700px;
  margin: 0 auto;
  padding: 2rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #21293c;
  text-align: center;
  margin-bottom: 0.5rem;
`

const Subtitle = styled.p`
  text-align: center;
  color: #667190;
  margin-bottom: 2rem;
`

const FormCard = styled.form`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 2rem;
`

const FormSection = styled.div`
  margin-bottom: 2rem;
  
  &:last-of-type {
    margin-bottom: 0;
  }
`

const SectionTitle = styled.h2`
  font-size: 1.125rem;
  font-weight: 600;
  color: #21293c;
  margin: 0 0 1.25rem 0;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
`

const Field = styled.div`
  margin-bottom: 1.25rem;
`

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #21293c;
  margin-bottom: 0.5rem;
`

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: border-color 0.2s, box-shadow 0.2s;
  
  &:focus {
    outline: none;
    border-color: #ff6154;
    box-shadow: 0 0 0 3px rgba(255, 97, 84, 0.1);
  }
  
  &::placeholder {
    color: #9ca3af;
  }
`

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  min-height: 120px;
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.2s, box-shadow 0.2s;
  
  &:focus {
    outline: none;
    border-color: #ff6154;
    box-shadow: 0 0 0 3px rgba(255, 97, 84, 0.1);
  }
  
  &::placeholder {
    color: #9ca3af;
  }
`

const Select = styled.select`
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
  
  &:focus {
    outline: none;
    border-color: #ff6154;
    box-shadow: 0 0 0 3px rgba(255, 97, 84, 0.1);
  }
`

const UploadArea = styled.div`
  border: 2px dashed #e5e7eb;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  
  &:hover {
    border-color: #ff6154;
    background: #fff5f4;
  }
`

const UploadText = styled.p`
  color: #667190;
  margin: 0;
  font-size: 0.875rem;
`

const PreviewImage = styled.img`
  max-width: 150px;
  max-height: 150px;
  border-radius: 8px;
  margin-top: 1rem;
`

const SubmitButton = styled.button`
  width: 100%;
  padding: 1rem;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #ff6154 0%, #ff8c42 100%);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(255, 97, 84, 0.3);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const ErrorMessage = styled.p`
  color: #dc2626;
  font-size: 0.875rem;
  margin: 0.5rem 0 0 0;
`

const SuccessMessage = styled.div`
  background: #dcfce7;
  border: 1px solid #86efac;
  color: #166534;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  text-align: center;
`

const LoginPrompt = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 16px;

  h2 {
    font-size: 1.5rem;
    color: #21293c;
    margin: 0 0 1rem 0;
  }

  p {
    color: #667190;
    margin: 0 0 1.5rem 0;
  }
`

const SignInButton = styled.a`
  display: inline-block;
  padding: 0.75rem 2rem;
  background: linear-gradient(135deg, #ff6154 0%, #ff8c42 100%);
  color: white;
  font-weight: 600;
  text-decoration: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(255, 97, 84, 0.3);
  }
`

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  margin-top: 0.5rem;
  overflow: hidden;
`

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(135deg, #ff6154 0%, #ff8c42 100%);
  width: ${props => props.progress}%;
  transition: width 0.3s ease;
`

const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export default function SubmitTool() {
  const router = useRouter()
  const { user, firebase } = useContext(FirebaseContext)
  
  const [formData, setFormData] = useState({
    name: "",
    tagline: "",
    description: "",
    website_url: "",
    category: "",
    tags: ""
  })
  
  const [logoUrl, setLogoUrl] = useState("")
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }))
    }
  }

  const handleUploadStart = () => {
    setProgress(0)
    setUploading(true)
  }

  const handleProgress = (prog) => {
    setProgress(prog)
  }

  const handleUploadError = (error) => {
    setUploading(false)
    console.error("Upload error:", error)
    setErrors(prev => ({ ...prev, logo: "Failed to upload image. Please try again." }))
  }

  const handleUploadSuccess = async (filename) => {
    setProgress(100)
    setUploading(false)
    try {
      const url = await firebase.storage.ref("ai_tools").child(filename).getDownloadURL()
      setLogoUrl(url)
    } catch (error) {
      console.error("Error getting download URL:", error)
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = "Tool name is required"
    }
    
    if (!formData.tagline.trim()) {
      newErrors.tagline = "Tagline is required"
    } else if (formData.tagline.length > 100) {
      newErrors.tagline = "Tagline must be under 100 characters"
    }
    
    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
    } else if (formData.description.length < 50) {
      newErrors.description = "Description must be at least 50 characters"
    }
    
    if (!formData.website_url.trim()) {
      newErrors.website_url = "Website URL is required"
    } else if (!/^https?:\/\/.+/.test(formData.website_url)) {
      newErrors.website_url = "Please enter a valid URL (starting with http:// or https://)"
    }
    
    if (!formData.category) {
      newErrors.category = "Please select a category"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!user) {
      router.push("/signin")
      return
    }
    
    if (!validateForm()) return
    
    setSubmitting(true)
    
    try {
      const slug = generateSlug(formData.name)
      const tagsArray = formData.tags
        .split(",")
        .map(tag => tag.trim().toLowerCase())
        .filter(tag => tag.length > 0)
      
      const toolData = {
        name: formData.name.trim(),
        tagline: formData.tagline.trim(),
        description: formData.description.trim(),
        website_url: formData.website_url.trim(),
        logo_url: logoUrl || "",
        category: formData.category,
        tags: tagsArray,
        slug: slug,
        upvotes: 0,
        hasVoted: [],
        featured: false,
        created_at: Date.now(),
        comments: [],
        comment_count: 0,
        creator: {
          id: user.uid,
          name: user.displayName || "Anonymous",
          avatar: user.photoURL || ""
        }
      }
      
      await firebase.db.collection("ai_tools").add(toolData)
      
      setSuccess(true)
      setTimeout(() => {
        router.push("/tool/" + slug)
      }, 1500)
      
    } catch (error) {
      console.error("Error submitting tool:", error)
      setErrors({ submit: "Failed to submit tool. Please try again." })
    } finally {
      setSubmitting(false)
    }
  }

  if (!user) {
    return (
      <Layout title="Submit Your AI Tool">
        <Wrapper>
          <LoginPrompt>
            <h2>Submit Your AI Tool</h2>
            <p>Sign in to submit your AI tool and reach thousands of users</p>
            <SignInButton href="/signin">Sign In to Continue</SignInButton>
          </LoginPrompt>
        </Wrapper>
      </Layout>
    )
  }

  return (
    <Layout title="Submit Your AI Tool">
      <Wrapper>
        <Title>Submit Your AI Tool</Title>
        <Subtitle>Get discovered by thousands of AI enthusiasts</Subtitle>
        
        {success && (
          <SuccessMessage>
            Tool submitted successfully! Redirecting...
          </SuccessMessage>
        )}
        
        <FormCard onSubmit={handleSubmit}>
          <FormSection>
            <SectionTitle>Basic Information</SectionTitle>
            
            <Field>
              <Label htmlFor="name">Tool Name *</Label>
              <Input
                type="text"
                id="name"
                name="name"
                placeholder="e.g., ChatGPT, Midjourney, Notion AI"
                value={formData.name}
                onChange={handleChange}
              />
              {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
            </Field>
            
            <Field>
              <Label htmlFor="tagline">Tagline *</Label>
              <Input
                type="text"
                id="tagline"
                name="tagline"
                placeholder="A short catchy description (max 100 chars)"
                value={formData.tagline}
                onChange={handleChange}
                maxLength={100}
              />
              {errors.tagline && <ErrorMessage>{errors.tagline}</ErrorMessage>}
            </Field>
            
            <Field>
              <Label htmlFor="website_url">Website URL *</Label>
              <Input
                type="url"
                id="website_url"
                name="website_url"
                placeholder="https://your-tool.com"
                value={formData.website_url}
                onChange={handleChange}
              />
              {errors.website_url && <ErrorMessage>{errors.website_url}</ErrorMessage>}
            </Field>
            
            <Field>
              <Label>Logo (Optional)</Label>
              <UploadArea>
                <FileUploader
                  accept="image/*"
                  randomizeFilename
                  storageRef={firebase.storage.ref("ai_tools")}
                  onUploadStart={handleUploadStart}
                  onUploadError={handleUploadError}
                  onUploadSuccess={handleUploadSuccess}
                  onProgress={handleProgress}
                  hidden
                  id="logo-upload"
                />
                <label htmlFor="logo-upload" style={{ cursor: 'pointer', display: 'block' }}>
                  <UploadText>
                    {uploading ? "Uploading... " + progress + "%" : "Click to upload logo (PNG, JPG)"}
                  </UploadText>
                </label>
                {uploading && (
                  <ProgressBar>
                    <ProgressFill progress={progress} />
                  </ProgressBar>
                )}
                {logoUrl && <PreviewImage src={logoUrl} alt="Logo preview" />}
              </UploadArea>
              {errors.logo && <ErrorMessage>{errors.logo}</ErrorMessage>}
            </Field>
          </FormSection>
          
          <FormSection>
            <SectionTitle>Details</SectionTitle>
            
            <Field>
              <Label htmlFor="category">Category *</Label>
              <Select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="">Select a category</option>
                {CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </Select>
              {errors.category && <ErrorMessage>{errors.category}</ErrorMessage>}
            </Field>
            
            <Field>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe what your tool does, key features, and why people should use it (minimum 50 characters)"
                value={formData.description}
                onChange={handleChange}
              />
              {errors.description && <ErrorMessage>{errors.description}</ErrorMessage>}
            </Field>
            
            <Field>
              <Label htmlFor="tags">Tags (Optional)</Label>
              <Input
                type="text"
                id="tags"
                name="tags"
                placeholder="ai, writing, productivity (comma separated)"
                value={formData.tags}
                onChange={handleChange}
              />
            </Field>
          </FormSection>
          
          {errors.submit && <ErrorMessage>{errors.submit}</ErrorMessage>}
          
          <SubmitButton type="submit" disabled={submitting || uploading}>
            {submitting ? "Submitting..." : "Submit Tool"}
          </SubmitButton>
        </FormCard>
      </Wrapper>
    </Layout>
  )
}
