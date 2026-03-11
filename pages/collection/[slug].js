import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import styled from "@emotion/styled"
import Layout from "@components/Layout/Layout"
import { AIToolCard } from "@components/AITool"
import firebase from "../../firebase/index"

const Wrapper = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`

const BackLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #667190;
  text-decoration: none;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;

  &:hover {
    color: #ff6154;
  }
`

const Header = styled.div`
  padding: 2.5rem;
  background: ${props => props.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  border-radius: 16px;
  color: white;
  margin-bottom: 2rem;
`

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
`

const Description = styled.p`
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0 0 1rem 0;
`

const Meta = styled.div`
  font-size: 0.9rem;
  opacity: 0.8;
`

const ToolList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`

const RankedItem = styled.div`
  display: flex;
  align-items: stretch;
`

const RankBadge = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  background: ${props => {
    if (props.rank === 1) return 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
    if (props.rank === 2) return 'linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%)'
    if (props.rank === 3) return 'linear-gradient(135deg, #CD7F32 0%, #8B4513 100%)'
    return '#f3f4f6'
  }};
  color: ${props => props.rank <= 3 ? 'white' : '#667190'};
  font-weight: 700;
  border-radius: 8px 0 0 8px;
`

const ToolCardWrapper = styled.div`
  flex: 1;
  
  & > a > li {
    border-radius: 0 8px 8px 0;
  }
`

const LoadingState = styled.div`
  display: flex;
  justify-content: center;
  padding: 4rem;
  
  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #f3f4f6;
    border-top-color: #ff6154;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`

const NotFound = styled.div`
  text-align: center;
  padding: 4rem 2rem;

  h1 {
    font-size: 2rem;
    color: #21293c;
    margin: 0 0 1rem 0;
  }

  p {
    color: #667190;
  }
`

// Collection definitions
const COLLECTIONS = {
  'best-ai-writing': {
    title: 'Best AI Writing Tools',
    description: 'Top tools for content creation, copywriting, and text generation',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    categories: ['ai-writing'],
  },
  'ai-image-generators': {
    title: 'AI Image Generators',
    description: 'Create stunning visuals, art, and graphics with artificial intelligence',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    categories: ['ai-image-generation'],
  },
  'developer-ai-tools': {
    title: 'AI Tools for Developers',
    description: 'Code faster and smarter with AI-powered development tools',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    categories: ['ai-coding-assistants'],
  },
  'ai-video-tools': {
    title: 'AI Video Creation',
    description: 'Generate, edit, and enhance videos using AI technology',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    categories: ['ai-video-creation'],
  },
  'productivity-ai': {
    title: 'AI Productivity Tools',
    description: 'Automate tasks, manage workflows, and boost your productivity',
    gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    categories: ['ai-productivity-tools'],
  },
  'marketing-ai': {
    title: 'AI Marketing Tools',
    description: 'Supercharge your marketing campaigns with AI assistance',
    gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)',
    categories: ['ai-marketing-tools'],
  },
}

export default function CollectionDetail() {
  const router = useRouter()
  const { slug } = router.query
  
  const [collection, setCollection] = useState(null)
  const [tools, setTools] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return

    const fetchCollection = async () => {
      setLoading(true)
      
      const collectionConfig = COLLECTIONS[slug]
      if (!collectionConfig) {
        setCollection(null)
        setLoading(false)
        return
      }

      try {
        const snapshot = await firebase.db.collection("ai_tools").get()
        const allTools = []
        snapshot.forEach(doc => {
          allTools.push({ id: doc.id, ...doc.data() })
        })

        const filteredTools = allTools
          .filter(t => collectionConfig.categories.includes(t.category))
          .sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0))

        setCollection(collectionConfig)
        setTools(filteredTools)
      } catch (error) {
        console.error("Error fetching collection:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCollection()
  }, [slug])

  if (loading) {
    return (
      <Layout title="Loading...">
        <Wrapper>
          <LoadingState>
            <div className="spinner" />
          </LoadingState>
        </Wrapper>
      </Layout>
    )
  }

  if (!collection) {
    return (
      <Layout title="Collection Not Found">
        <Wrapper>
          <NotFound>
            <h1>Collection Not Found</h1>
            <p>This collection doesn't exist.</p>
            <Link href="/collections">
              <a style={{ color: '#ff6154' }}>← Back to Collections</a>
            </Link>
          </NotFound>
        </Wrapper>
      </Layout>
    )
  }

  return (
    <Layout
      title={`${collection.title} - AI Tool Collections`}
      description={collection.description}
    >
      <Wrapper>
        <Link href="/collections" passHref>
          <BackLink>← Back to Collections</BackLink>
        </Link>

        <Header gradient={collection.gradient}>
          <Title>{collection.title}</Title>
          <Description>{collection.description}</Description>
          <Meta>{tools.length} tools in this collection</Meta>
        </Header>

        <ToolList>
          {tools.map((tool, index) => (
            <RankedItem key={tool.id}>
              <RankBadge rank={index + 1}>{index + 1}</RankBadge>
              <ToolCardWrapper>
                <AIToolCard tool={tool} />
              </ToolCardWrapper>
            </RankedItem>
          ))}
        </ToolList>
      </Wrapper>
    </Layout>
  )
}
