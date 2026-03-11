import { useState, useEffect, useContext } from "react"
import { useRouter } from "next/router"
import styled from "@emotion/styled"
import Link from "next/link"
import { default as formatTimeToNow } from "date-fns/formatDistanceToNow"
import { enUS } from "date-fns/locale"

import Layout from "@components/Layout/Layout"
import { AIToolCard, AIToolListSkeleton } from "@components/AITool"
import { FirebaseContext } from "../../firebase/index"
import { getCategoryById, getCategoryBySlug } from "../../utils/categories"
import BackIcon from "@components/UI/BackIcon"

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`

const Breadcrumb = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`

const BreadcrumbLink = styled.a`
  color: #667190;
  text-decoration: none;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 0.25rem;

  &:hover {
    color: var(--orange);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`

const BreadcrumbSeparator = styled.span`
  color: #d1d5db;
`

const BreadcrumbCurrent = styled.span`
  color: #21293c;
  font-size: 14px;
  font-weight: 500;
`

const ToolHeader = styled.div`
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 600px) {
    grid-template-columns: 80px 1fr;
    gap: 1rem;
  }
`

const LogoContainer = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 16px;
  overflow: hidden;
  background-color: #f5f5f5;
  flex-shrink: 0;

  @media (max-width: 600px) {
    width: 80px;
    height: 80px;
    border-radius: 12px;
  }
`

const Logo = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`

const LogoPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2.5rem;
  font-weight: bold;

  @media (max-width: 600px) {
    font-size: 1.5rem;
  }
`

const HeaderInfo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 0.5rem;
`

const ToolName = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #21293c;
  margin: 0;

  @media (max-width: 600px) {
    font-size: 1.5rem;
  }
`

const FeaturedBadge = styled.span`
  background: linear-gradient(135deg, #ff6154 0%, #ff9a8b 100%);
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 6px;
  text-transform: uppercase;
`

const Tagline = styled.p`
  font-size: 1.25rem;
  color: #667190;
  margin: 0 0 1rem 0;

  @media (max-width: 600px) {
    font-size: 1rem;
  }
`

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`

const CategoryLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background-color: #eef2ff;
  color: #4b587c;
  font-size: 13px;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.2s ease;

  &:hover {
    background-color: #e0e7ff;
  }
`

const TimeAgo = styled.span`
  font-size: 13px;
  color: #9ca3af;
`

const ActionBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`

const VisitButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  background-color: #fff;
  color: #21293c;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  text-decoration: none;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--orange);
    color: var(--orange);
  }
`

const UpvoteButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  background: ${props => props.upvoted ? "#fff5f4" : "linear-gradient(135deg, #ff6154 0%, #ff9a8b 100%)"};
  color: ${props => props.upvoted ? "var(--orange)" : "white"};
  border: ${props => props.upvoted ? "2px solid var(--orange)" : "none"};
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 97, 84, 0.3);
  }
`

const UpvoteIcon = styled.span`
  font-size: 16px;
`

const Section = styled.section`
  margin-bottom: 2.5rem;
`

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #21293c;
  margin: 0 0 1rem 0;
`

const Description = styled.div`
  font-size: 1rem;
  line-height: 1.7;
  color: #4b587c;
  white-space: pre-wrap;
`

const TagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`

const Tag = styled.span`
  background-color: #f3f4f6;
  color: #4b587c;
  font-size: 13px;
  padding: 4px 10px;
  border-radius: 12px;
`

const ToolList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const NotFoundContainer = styled.div`
  text-align: center;
  padding: 4rem 2rem;
`

const NotFoundTitle = styled.h1`
  font-size: 1.5rem;
  color: #21293c;
  margin-bottom: 1rem;
`

const NotFoundText = styled.p`
  color: #667190;
  margin-bottom: 1.5rem;
`

const HomeLink = styled.a`
  display: inline-block;
  background: linear-gradient(135deg, #ff6154 0%, #ff9a8b 100%);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  cursor: pointer;
`

// Share Buttons
const ShareSection = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`

const ShareButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: ${props => props.bg || '#f3f4f6'};
  color: ${props => props.color || '#4b587c'};
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`

const CopySuccess = styled.span`
  color: #10b981;
  font-size: 13px;
  margin-left: 0.5rem;
`

// Comments Section
const CommentsSection = styled.section`
  margin-top: 2.5rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
`

const CommentForm = styled.form`
  margin-bottom: 2rem;
`

const CommentInput = styled.textarea`
  width: 100%;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: inherit;
  resize: vertical;
  min-height: 100px;
  box-sizing: border-box;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #ff6154;
  }

  &::placeholder {
    color: #9ca3af;
  }
`

const CommentSubmitRow = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 0.75rem;
`

const CommentSubmitButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #ff6154 0%, #ff9a8b 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const CommentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const CommentItem = styled.div`
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
`

const CommentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`

const CommentAuthor = styled.span`
  font-weight: 600;
  color: #21293c;
  font-size: 0.9rem;
`

const CommentTime = styled.span`
  color: #9ca3af;
  font-size: 0.8rem;
`

const CommentText = styled.p`
  margin: 0;
  color: #4b587c;
  font-size: 0.95rem;
  line-height: 1.5;
`

const NoComments = styled.p`
  text-align: center;
  color: #9ca3af;
  padding: 2rem;
  background: #f9fafb;
  border-radius: 8px;
`

const LoginPrompt = styled.p`
  text-align: center;
  color: #667190;
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 8px;

  a {
    color: #ff6154;
    text-decoration: none;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  }
`

export default function ToolPage() {
  const router = useRouter()
  const { slug } = router.query

  const { user, firebase } = useContext(FirebaseContext)

  const [tool, setTool] = useState(null)
  const [relatedTools, setRelatedTools] = useState([])
  const [loading, setLoading] = useState(true)
  const [upvoted, setUpvoted] = useState(false)
  const [currentUpvotes, setCurrentUpvotes] = useState(0)
  const [logoError, setLogoError] = useState(false)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState("")
  const [commentLoading, setCommentLoading] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  useEffect(() => {
    if (!slug || !firebase) return

    const fetchTool = async () => {
      setLoading(true)
      try {
        // Fetch the tool by slug
        const snapshot = await firebase.db
          .collection("ai_tools")
          .where("slug", "==", slug)
          .get()

        if (snapshot.empty) {
          setTool(null)
          setLoading(false)
          return
        }

        const doc = snapshot.docs[0]
        const toolData = { id: doc.id, ...doc.data() }
        setTool(toolData)
        setCurrentUpvotes(toolData.upvotes || 0)

        // Check if user has upvoted
        if (user && toolData.hasVoted) {
          setUpvoted(toolData.hasVoted.includes(user.uid))
        }

        // Fetch related tools from same category
        if (toolData.category) {
          const relatedSnapshot = await firebase.db
            .collection("ai_tools")
            .where("category", "==", toolData.category)
            .orderBy("upvotes", "desc")
            .limit(5)
            .get()

          const related = []
          relatedSnapshot.forEach(doc => {
            if (doc.id !== toolData.id) {
              related.push({ id: doc.id, ...doc.data() })
            }
          })
          setRelatedTools(related.slice(0, 4))
        }
      } catch (error) {
        console.error("Error fetching tool:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTool()
  }, [slug, firebase, user])

  const handleUpvote = async () => {
    if (!user) {
      router.push("/signin")
      return
    }

    if (!tool) return

    const hasVoted = tool.hasVoted || []
    let newUpvotes = currentUpvotes
    let newHasVoted = [...hasVoted]

    if (hasVoted.includes(user.uid)) {
      newUpvotes = currentUpvotes - 1
      newHasVoted = newHasVoted.filter(uid => uid !== user.uid)
    } else {
      newUpvotes = currentUpvotes + 1
      newHasVoted = [...newHasVoted, user.uid]
    }

    setUpvoted(newHasVoted.includes(user.uid))
    setCurrentUpvotes(newUpvotes)
    setTool({ ...tool, hasVoted: newHasVoted, upvotes: newUpvotes })

    await firebase.db.collection("ai_tools").doc(tool.id).update({
      upvotes: newUpvotes,
      hasVoted: newHasVoted,
    })
  }

  // Share handlers
  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const shareText = `Check out ${tool?.name} - ${tool?.tagline} on Launch AI Jam!`

  const shareOnTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank')
  }

  const shareOnLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank')
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // Comment handlers
  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    if (!user || !newComment.trim() || !tool) return

    setCommentLoading(true)
    try {
      const comment = {
        text: newComment.trim(),
        author: {
          id: user.uid,
          name: user.displayName || 'Anonymous',
          avatar: user.photoURL || '',
        },
        created_at: Date.now(),
      }

      const updatedComments = [...(tool.comments || []), comment]
      
      await firebase.db.collection("ai_tools").doc(tool.id).update({
        comments: updatedComments,
        comment_count: updatedComments.length,
      })

      setComments(updatedComments)
      setTool({ ...tool, comments: updatedComments })
      setNewComment("")
    } catch (error) {
      console.error("Error posting comment:", error)
    } finally {
      setCommentLoading(false)
    }
  }

  // Load comments when tool loads
  useEffect(() => {
    if (tool?.comments) {
      setComments(tool.comments)
    }
  }, [tool?.comments])

  const getInitials = (name) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return (
      <Layout title="Loading...">
        <Container>
          <AIToolListSkeleton count={1} loading={true} />
        </Container>
      </Layout>
    )
  }

  if (!tool) {
    return (
      <Layout title="Tool Not Found">
        <Container>
          <NotFoundContainer>
            <NotFoundTitle>🔍 Tool Not Found</NotFoundTitle>
            <NotFoundText>
              The AI tool you're looking for doesn't exist or has been removed.
            </NotFoundText>
            <Link href="/" passHref legacyBehavior>
              <HomeLink>Go Home</HomeLink>
            </Link>
          </NotFoundContainer>
        </Container>
      </Layout>
    )
  }

  const category = getCategoryById(tool.category) || getCategoryBySlug(tool.category)

  return (
    <Layout
      title={`${tool.name} - ${tool.tagline}`}
      description={tool.description?.slice(0, 160)}
      keywords={`${tool.name}, ${tool.tags?.join(", ")}, AI tool`}
      ogImage={tool.logo_url}
    >
      <Container>
        <Breadcrumb>
          <Link href="/" passHref legacyBehavior>
            <BreadcrumbLink>
              <BackIcon />
              Home
            </BreadcrumbLink>
          </Link>
          <BreadcrumbSeparator>/</BreadcrumbSeparator>
          {category && (
            <>
              <Link href={`/category/${category.slug}`} passHref legacyBehavior>
                <BreadcrumbLink>{category.name}</BreadcrumbLink>
              </Link>
              <BreadcrumbSeparator>/</BreadcrumbSeparator>
            </>
          )}
          <BreadcrumbCurrent>{tool.name}</BreadcrumbCurrent>
        </Breadcrumb>

        <ToolHeader>
          <LogoContainer>
            {(logoError || !tool.logo_url) ? (
              <LogoPlaceholder>{getInitials(tool.name)}</LogoPlaceholder>
            ) : (
              <Logo
                src={tool.logo_url}
                alt={`${tool.name} logo`}
                onError={() => setLogoError(true)}
              />
            )}
          </LogoContainer>
          <HeaderInfo>
            <TitleRow>
              <ToolName>{tool.name}</ToolName>
              {tool.featured && <FeaturedBadge>Featured</FeaturedBadge>}
            </TitleRow>
            <Tagline>{tool.tagline}</Tagline>
            <MetaRow>
              {category && (
                <Link href={`/category/${category.slug}`} passHref legacyBehavior>
                  <CategoryLink>
                    {category.icon} {category.name}
                  </CategoryLink>
                </Link>
              )}
              {tool.created_at && (
                <TimeAgo>
                  Added {formatTimeToNow(new Date(tool.created_at), { locale: enUS })} ago
                </TimeAgo>
              )}
            </MetaRow>
          </HeaderInfo>
        </ToolHeader>

        <ActionBar>
          <UpvoteButton onClick={handleUpvote} upvoted={upvoted}>
            <UpvoteIcon>{upvoted ? "❤️" : "△"}</UpvoteIcon>
            {upvoted ? "Upvoted" : "Upvote"} · {currentUpvotes}
          </UpvoteButton>
          {tool.website_url && (
            <VisitButton href={tool.website_url} target="_blank" rel="noopener noreferrer">
              🌐 Visit Website
            </VisitButton>
          )}
        </ActionBar>

        <Section>
          <SectionTitle>About</SectionTitle>
          <Description>{tool.description}</Description>
        </Section>

        {tool.tags && tool.tags.length > 0 && (
          <Section>
            <SectionTitle>Tags</SectionTitle>
            <TagList>
              {tool.tags.map((tag, index) => (
                <Tag key={index}>#{tag}</Tag>
              ))}
            </TagList>
          </Section>
        )}

        <Section>
          <SectionTitle>Share</SectionTitle>
          <ShareSection>
            <ShareButton bg="#1DA1F2" color="white" onClick={shareOnTwitter}>
              𝕏 Share on Twitter
            </ShareButton>
            <ShareButton bg="#0077B5" color="white" onClick={shareOnLinkedIn}>
              in Share on LinkedIn
            </ShareButton>
            <ShareButton onClick={copyLink}>
              🔗 Copy Link
              {copySuccess && <CopySuccess>✓ Copied!</CopySuccess>}
            </ShareButton>
          </ShareSection>
        </Section>

        <CommentsSection>
          <SectionTitle>💬 Discussion ({comments.length})</SectionTitle>
          
          {user ? (
            <CommentForm onSubmit={handleCommentSubmit}>
              <CommentInput
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts about this tool..."
                maxLength={1000}
              />
              <CommentSubmitRow>
                <CommentSubmitButton type="submit" disabled={commentLoading || !newComment.trim()}>
                  {commentLoading ? "Posting..." : "Post Comment"}
                </CommentSubmitButton>
              </CommentSubmitRow>
            </CommentForm>
          ) : (
            <LoginPrompt>
              <Link href="/signin">Sign in</Link> to join the discussion
            </LoginPrompt>
          )}

          {comments.length > 0 ? (
            <CommentList>
              {comments.slice().reverse().map((comment, index) => (
                <CommentItem key={index}>
                  <CommentHeader>
                    <CommentAuthor>{comment.author?.name || 'Anonymous'}</CommentAuthor>
                    {comment.created_at && (
                      <CommentTime>
                        {formatTimeToNow(new Date(comment.created_at), { locale: enUS })} ago
                      </CommentTime>
                    )}
                  </CommentHeader>
                  <CommentText>{comment.text}</CommentText>
                </CommentItem>
              ))}
            </CommentList>
          ) : (
            <NoComments>No comments yet. Be the first to share your thoughts!</NoComments>
          )}
        </CommentsSection>

        {relatedTools.length > 0 && (
          <Section>
            <SectionTitle>Related Tools in {category?.name || "this category"}</SectionTitle>
            <ToolList>
              {relatedTools.map(relatedTool => (
                <AIToolCard key={relatedTool.id} tool={relatedTool} showCategory={false} />
              ))}
            </ToolList>
          </Section>
        )}
      </Container>
    </Layout>
  )
}
