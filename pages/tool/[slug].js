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
