import { useEffect, useState } from "react"
import Link from "next/link"
import styled from "@emotion/styled"
import Layout from "@components/Layout/Layout"
import { AIToolCard } from "@components/AITool"
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
  margin: 0;
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`

const Section = styled.section`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  overflow: hidden;
`

const SectionHeader = styled.div`
  padding: 1.25rem 1.5rem;
  background: ${props => props.bg || '#f9fafb'};
  border-bottom: 1px solid #e5e7eb;
`

const SectionTitle = styled.h2`
  font-size: 1.1rem;
  font-weight: 600;
  color: #21293c;
  margin: 0 0 0.25rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const SectionSubtitle = styled.p`
  font-size: 0.875rem;
  color: #667190;
  margin: 0;
`

const SectionBody = styled.div`
  padding: 1rem 1.5rem;
  max-height: 400px;
  overflow-y: auto;
`

const ToolList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const MiniToolItem = styled.a`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border-radius: 8px;
  text-decoration: none;
  transition: background 0.2s;

  &:hover {
    background: #f9fafb;
  }
`

const MiniLogo = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: ${props => props.src ? `url(${props.src}) center/cover` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  flex-shrink: 0;
`

const MiniInfo = styled.div`
  flex: 1;
  min-width: 0;
`

const MiniName = styled.div`
  font-weight: 500;
  color: #21293c;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const MiniTagline = styled.div`
  font-size: 0.8rem;
  color: #667190;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const MiniVotes = styled.div`
  font-size: 0.8rem;
  font-weight: 600;
  color: #ff6154;
  white-space: nowrap;
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

const EmptyState = styled.p`
  text-align: center;
  color: #9ca3af;
  padding: 1.5rem;
  font-size: 0.875rem;
`

const ViewMoreLink = styled.a`
  display: block;
  text-align: center;
  padding: 0.75rem;
  color: #ff6154;
  font-weight: 500;
  font-size: 0.875rem;
  text-decoration: none;
  border-top: 1px solid #e5e7eb;
  transition: background 0.2s;

  &:hover {
    background: #fff5f4;
  }
`

// Trending score algorithm: combines votes, recency, and velocity
const calculateTrendingScore = (tool) => {
  const votes = tool.upvotes || 0
  const ageHours = (Date.now() - (tool.created_at || Date.now())) / (1000 * 60 * 60)
  const gravity = 1.8 // Higher = older items decay faster
  
  // Hacker News-style algorithm
  return votes / Math.pow(ageHours + 2, gravity)
}

// Hidden gems: low votes but good engagement potential (newer, from active creators)
const isHiddenGem = (tool, allTools) => {
  const votes = tool.upvotes || 0
  const avgVotes = allTools.reduce((sum, t) => sum + (t.upvotes || 0), 0) / allTools.length
  const ageHours = (Date.now() - (tool.created_at || Date.now())) / (1000 * 60 * 60)
  
  // Less than average votes but reasonably new (within 14 days)
  return votes < avgVotes && votes >= 5 && ageHours < 336
}

export default function Discover() {
  const [loading, setLoading] = useState(true)
  const [trendingTools, setTrendingTools] = useState([])
  const [hiddenGems, setHiddenGems] = useState([])
  const [recentTools, setRecentTools] = useState([])
  const [editorPicks, setEditorPicks] = useState([])

  useEffect(() => {
    const fetchDiscoverData = async () => {
      setLoading(true)
      try {
        const snapshot = await firebase.db.collection("ai_tools").get()
        const allTools = []
        snapshot.forEach(doc => {
          allTools.push({ id: doc.id, ...doc.data() })
        })

        // Trending: use algorithm
        const trending = [...allTools]
          .map(tool => ({ ...tool, score: calculateTrendingScore(tool) }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 10)
        setTrendingTools(trending)

        // Hidden gems
        const gems = allTools
          .filter(tool => isHiddenGem(tool, allTools))
          .sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0))
          .slice(0, 10)
        setHiddenGems(gems)

        // Recently launched (last 48 hours)
        const recent = allTools
          .filter(t => (t.created_at || 0) >= Date.now() - 48 * 60 * 60 * 1000)
          .sort((a, b) => (b.created_at || 0) - (a.created_at || 0))
          .slice(0, 10)
        setRecentTools(recent)

        // Editor picks (featured tools)
        const picks = allTools
          .filter(t => t.featured)
          .sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0))
          .slice(0, 10)
        setEditorPicks(picks)

      } catch (error) {
        console.error("Error fetching discover data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDiscoverData()
  }, [])

  const renderToolList = (tools, emptyMessage) => {
    if (tools.length === 0) {
      return <EmptyState>{emptyMessage}</EmptyState>
    }
    return (
      <ToolList>
        {tools.map(tool => (
          <Link key={tool.id} href={`/tool/${tool.slug}`} passHref legacyBehavior>
            <MiniToolItem>
              <MiniLogo src={tool.logo_url}>
                {!tool.logo_url && tool.name[0]}
              </MiniLogo>
              <MiniInfo>
                <MiniName>{tool.name}</MiniName>
                <MiniTagline>{tool.tagline}</MiniTagline>
              </MiniInfo>
              <MiniVotes>▲ {tool.upvotes || 0}</MiniVotes>
            </MiniToolItem>
          </Link>
        ))}
      </ToolList>
    )
  }

  if (loading) {
    return (
      <Layout title="Discover AI Tools">
        <Wrapper>
          <LoadingState>
            <div className="spinner" />
          </LoadingState>
        </Wrapper>
      </Layout>
    )
  }

  return (
    <Layout
      title="Discover AI Tools - Hidden Gems & Trending"
      description="Explore trending AI tools, hidden gems, and editor picks. Find your next favorite AI tool."
    >
      <Wrapper>
        <Header>
          <Title>🔍 Discover</Title>
          <Subtitle>Find trending tools, hidden gems, and editor picks</Subtitle>
        </Header>

        <Grid>
          <Section>
            <SectionHeader bg="linear-gradient(135deg, #fff5f4 0%, #fff 100%)">
              <SectionTitle>🔥 Trending Now</SectionTitle>
              <SectionSubtitle>Tools gaining momentum based on votes and recency</SectionSubtitle>
            </SectionHeader>
            <SectionBody>
              {renderToolList(trendingTools, "No trending tools yet")}
            </SectionBody>
            <Link href="/trending" passHref legacyBehavior>
              <ViewMoreLink>View all trending →</ViewMoreLink>
            </Link>
          </Section>

          <Section>
            <SectionHeader bg="linear-gradient(135deg, #f0fdf4 0%, #fff 100%)">
              <SectionTitle>💎 Hidden Gems</SectionTitle>
              <SectionSubtitle>Quality tools that deserve more attention</SectionSubtitle>
            </SectionHeader>
            <SectionBody>
              {renderToolList(hiddenGems, "No hidden gems found")}
            </SectionBody>
          </Section>

          <Section>
            <SectionHeader bg="linear-gradient(135deg, #eff6ff 0%, #fff 100%)">
              <SectionTitle>🆕 Recently Launched</SectionTitle>
              <SectionSubtitle>Fresh tools from the last 48 hours</SectionSubtitle>
            </SectionHeader>
            <SectionBody>
              {renderToolList(recentTools, "No recent launches")}
            </SectionBody>
          </Section>

          <Section>
            <SectionHeader bg="linear-gradient(135deg, #fef3c7 0%, #fff 100%)">
              <SectionTitle>⭐ Editor Picks</SectionTitle>
              <SectionSubtitle>Hand-picked featured tools</SectionSubtitle>
            </SectionHeader>
            <SectionBody>
              {renderToolList(editorPicks, "No editor picks yet")}
            </SectionBody>
          </Section>
        </Grid>
      </Wrapper>
    </Layout>
  )
}
