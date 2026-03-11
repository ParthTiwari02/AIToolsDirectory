import { useEffect, useState, useContext } from "react"
import Link from "next/link"
import styled from "@emotion/styled"
import Layout from "@components/Layout/Layout"
import { AIToolCard } from "@components/AITool"
import { FirebaseContext } from "../firebase/index"
import firebase from "../firebase/index"

const Wrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #21293c;
  margin: 0 0 0.5rem 0;
`

const Subtitle = styled.p`
  color: #667190;
  font-size: 1.1rem;
  margin: 0 0 2rem 0;
`

const CreateButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 2rem;
  background: linear-gradient(135deg, #ff6154 0%, #ff9a8b 100%);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
`

const CollectionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
`

const CollectionCard = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  }
`

const CollectionHeader = styled.div`
  padding: 1.5rem;
  background: ${props => props.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  color: white;
`

const CollectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
`

const CollectionDescription = styled.p`
  font-size: 0.875rem;
  opacity: 0.9;
  margin: 0;
`

const CollectionBody = styled.div`
  padding: 1rem 1.5rem;
`

const CollectionMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  color: #667190;
`

const ToolPreview = styled.div`
  display: flex;
  margin-top: 1rem;
`

const ToolLogo = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: ${props => props.src ? `url(${props.src}) center/cover` : '#f3f4f6'};
  border: 2px solid white;
  margin-left: -8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;

  &:first-of-type {
    margin-left: 0;
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

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background: #f9fafb;
  border-radius: 16px;

  h3 {
    font-size: 1.25rem;
    color: #21293c;
    margin: 0 0 0.5rem 0;
  }

  p {
    color: #667190;
    margin: 0;
  }
`

// Predefined collections based on categories
const PRESET_COLLECTIONS = [
  {
    id: 'best-ai-writing',
    title: 'Best AI Writing Tools',
    description: 'Top tools for content creation and copywriting',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    categories: ['ai-writing'],
  },
  {
    id: 'ai-image-generators',
    title: 'AI Image Generators',
    description: 'Create stunning visuals with AI',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    categories: ['ai-image-generation'],
  },
  {
    id: 'developer-ai-tools',
    title: 'AI Tools for Developers',
    description: 'Code faster with AI assistance',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    categories: ['ai-coding-assistants'],
  },
  {
    id: 'ai-video-tools',
    title: 'AI Video Creation',
    description: 'Generate and edit videos with AI',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    categories: ['ai-video-creation'],
  },
  {
    id: 'productivity-ai',
    title: 'AI Productivity Tools',
    description: 'Automate tasks and save time',
    gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    categories: ['ai-productivity-tools'],
  },
  {
    id: 'marketing-ai',
    title: 'AI Marketing Tools',
    description: 'Supercharge your marketing with AI',
    gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)',
    categories: ['ai-marketing-tools'],
  },
]

export default function Collections() {
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useContext(FirebaseContext)

  useEffect(() => {
    const fetchCollections = async () => {
      setLoading(true)
      try {
        // Fetch tools to populate preset collections
        const snapshot = await firebase.db.collection("ai_tools").get()
        const allTools = []
        snapshot.forEach(doc => {
          allTools.push({ id: doc.id, ...doc.data() })
        })

        // Build collections with tools
        const builtCollections = PRESET_COLLECTIONS.map(preset => {
          const tools = allTools
            .filter(t => preset.categories.includes(t.category))
            .sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0))
            .slice(0, 10)

          return {
            ...preset,
            tools,
            toolCount: tools.length,
          }
        }).filter(c => c.toolCount > 0)

        setCollections(builtCollections)
      } catch (error) {
        console.error("Error fetching collections:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCollections()
  }, [])

  return (
    <Layout
      title="AI Tool Collections - Curated Lists"
      description="Explore curated collections of the best AI tools organized by use case."
    >
      <Wrapper>
        <Header>
          <Title>📚 Collections</Title>
          <Subtitle>Curated lists of the best AI tools for every use case</Subtitle>
        </Header>

        {loading ? (
          <LoadingState>
            <div className="spinner" />
          </LoadingState>
        ) : collections.length === 0 ? (
          <EmptyState>
            <h3>No collections yet</h3>
            <p>Collections will appear here as tools are added.</p>
          </EmptyState>
        ) : (
          <CollectionsGrid>
            {collections.map(collection => (
              <Link key={collection.id} href={`/collection/${collection.id}`}>
                <a style={{ textDecoration: 'none' }}>
                  <CollectionCard>
                    <CollectionHeader gradient={collection.gradient}>
                      <CollectionTitle>{collection.title}</CollectionTitle>
                      <CollectionDescription>{collection.description}</CollectionDescription>
                    </CollectionHeader>
                    <CollectionBody>
                      <CollectionMeta>
                        <span>{collection.toolCount} tools</span>
                        <span>View collection →</span>
                      </CollectionMeta>
                      <ToolPreview>
                        {collection.tools.slice(0, 5).map((tool, i) => (
                          <ToolLogo key={tool.id} src={tool.logo_url}>
                            {!tool.logo_url && tool.name[0]}
                          </ToolLogo>
                        ))}
                        {collection.toolCount > 5 && (
                          <ToolLogo>+{collection.toolCount - 5}</ToolLogo>
                        )}
                      </ToolPreview>
                    </CollectionBody>
                  </CollectionCard>
                </a>
              </Link>
            ))}
          </CollectionsGrid>
        )}
      </Wrapper>
    </Layout>
  )
}
