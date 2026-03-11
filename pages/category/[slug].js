import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import styled from "@emotion/styled"
import Link from "next/link"

import Layout from "@components/Layout/Layout"
import { AIToolCard, AIToolListSkeleton } from "@components/AITool"
import firebase from "../../firebase/index"
import { getCategoryBySlug, CATEGORIES } from "../../utils/categories"
import BackIcon from "@components/UI/BackIcon"

const Container = styled.div`
  max-width: 1000px;
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

const Header = styled.div`
  margin-bottom: 2rem;
`

const CategoryIcon = styled.span`
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
`

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #21293c;
  margin: 0 0 0.5rem 0;
`

const Description = styled.p`
  font-size: 1.1rem;
  color: #667190;
  margin: 0;
`

const ToolCount = styled.span`
  display: inline-block;
  margin-top: 1rem;
  font-size: 14px;
  color: #9ca3af;
  background-color: #f3f4f6;
  padding: 4px 12px;
  border-radius: 12px;
`

const SortBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
`

const SortLabel = styled.span`
  font-size: 14px;
  color: #667190;
`

const SortSelect = styled.select`
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  color: #4b587c;
  background-color: #fff;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: var(--orange);
  }
`

const ToolList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background-color: #f9fafb;
  border-radius: 12px;
`

const EmptyTitle = styled.h2`
  font-size: 1.25rem;
  color: #21293c;
  margin: 0 0 0.5rem 0;
`

const EmptyText = styled.p`
  color: #667190;
  margin: 0 0 1.5rem 0;
`

const SubmitLink = styled.a`
  display: inline-block;
  background: linear-gradient(135deg, #ff6154 0%, #ff9a8b 100%);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 97, 84, 0.4);
  }
`

const FeaturedSection = styled.div`
  margin-bottom: 2rem;
`

const FeaturedTitle = styled.h2`
  font-size: 1rem;
  font-weight: 600;
  color: #667190;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 1rem 0;
`

export default function CategoryPage() {
  const router = useRouter()
  const { slug } = router.query

  const [tools, setTools] = useState([])
  const [featuredTools, setFeaturedTools] = useState([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState("newest")

  const category = getCategoryBySlug(slug)

  useEffect(() => {
    if (!slug) return

    const fetchTools = async () => {
      setLoading(true)
      try {
        // Fetch all tools and filter in memory to avoid index requirements
        const snapshot = await firebase.db
          .collection("ai_tools")
          .get()

        const allTools = []
        snapshot.forEach(doc => {
          allTools.push({ id: doc.id, ...doc.data() })
        })

        // Filter by category
        const categoryTools = allTools.filter(t => t.category === slug)

        // Featured tools in this category
        const featured = categoryTools
          .filter(t => t.featured === true)
          .sort((a, b) => (b.created_at || 0) - (a.created_at || 0))
        setFeaturedTools(featured)

        // Sort based on sortBy
        const sorted = [...categoryTools].sort((a, b) => {
          if (sortBy === "upvotes") {
            return (b.upvotes || 0) - (a.upvotes || 0)
          }
          return (b.created_at || 0) - (a.created_at || 0)
        })
        setTools(sorted)
      } catch (error) {
        console.error("Error fetching tools:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTools()
  }, [slug, sortBy])

  const handleSortChange = (e) => {
    setSortBy(e.target.value)
  }

  if (!category) {
    return (
      <Layout title="Category Not Found">
        <Container>
          <EmptyState>
            <EmptyTitle>Category Not Found</EmptyTitle>
            <EmptyText>The category you're looking for doesn't exist.</EmptyText>
            <Link href="/" passHref legacyBehavior>
              <SubmitLink>Go Home</SubmitLink>
            </Link>
          </EmptyState>
        </Container>
      </Layout>
    )
  }

  return (
    <Layout
      title={`${category.name} - Best AI Tools`}
      description={`Discover the best ${category.name.toLowerCase()}. ${category.description}`}
      keywords={`${category.name}, AI tools, ${category.slug.replace(/-/g, ' ')}`}
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
          <BreadcrumbCurrent>{category.name}</BreadcrumbCurrent>
        </Breadcrumb>

        <Header>
          <CategoryIcon>{category.icon}</CategoryIcon>
          <Title>{category.name}</Title>
          <Description>{category.description}</Description>
          {!loading && (
            <ToolCount>{tools.length} tool{tools.length !== 1 ? 's' : ''}</ToolCount>
          )}
        </Header>

        {/* Featured Tools in this Category */}
        {featuredTools.length > 0 && (
          <FeaturedSection>
            <FeaturedTitle>⭐ Featured in {category.name}</FeaturedTitle>
            <ToolList>
              {featuredTools.map(tool => (
                <AIToolCard key={tool.id} tool={tool} showCategory={false} />
              ))}
            </ToolList>
          </FeaturedSection>
        )}

        <SortBar>
          <SortLabel>All {category.name}</SortLabel>
          <SortSelect value={sortBy} onChange={handleSortChange}>
            <option value="newest">Newest</option>
            <option value="upvotes">Most Upvoted</option>
          </SortSelect>
        </SortBar>

        <ToolList>
          {loading && <AIToolListSkeleton count={5} loading={true} />}
          
          {!loading && tools.length === 0 && (
            <EmptyState>
              <EmptyTitle>No tools yet in {category.name}</EmptyTitle>
              <EmptyText>Be the first to submit an AI tool in this category!</EmptyText>
              <Link href="/submit" passHref legacyBehavior>
                <SubmitLink>Submit AI Tool</SubmitLink>
              </Link>
            </EmptyState>
          )}

          {!loading && tools
            .filter(tool => !featuredTools.find(f => f.id === tool.id))
            .map(tool => (
              <AIToolCard key={tool.id} tool={tool} showCategory={false} />
            ))
          }
        </ToolList>
      </Container>
    </Layout>
  )
}
