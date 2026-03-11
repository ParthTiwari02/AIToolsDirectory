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
  padding: 3rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  color: white;
`

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
`

const Subtitle = styled.p`
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
`

const WeekLabel = styled.div`
  display: inline-block;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  margin-top: 1rem;
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`

const MainSection = styled.div``

const Sidebar = styled.div`
  @media (max-width: 900px) {
    order: -1;
  }
`

const Section = styled.section`
  margin-bottom: 2.5rem;
`

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #21293c;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

const Card = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
`

const CardTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #21293c;
  margin: 0 0 1rem 0;
`

const CreatorItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f3f4f6;

  &:last-child {
    border-bottom: none;
  }
`

const CreatorAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.src ? `url(${props.src}) center/cover` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1rem;
`

const CreatorInfo = styled.div`
  flex: 1;
`

const CreatorName = styled.div`
  font-weight: 500;
  color: #21293c;
  font-size: 0.9rem;
`

const CreatorStats = styled.div`
  font-size: 0.75rem;
  color: #667190;
`

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  background: #f9fafb;
  border-radius: 12px;
  color: #667190;
`

const LoadingState = styled.div`
  display: flex;
  justify-content: center;
  padding: 3rem;
  
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

const CategoryTag = styled.span`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background: #f3f4f6;
  border-radius: 4px;
  font-size: 0.75rem;
  color: #667190;
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
`

export default function WeeklyBest() {
  const [topTools, setTopTools] = useState([])
  const [mostDiscussed, setMostDiscussed] = useState([])
  const [topCreators, setTopCreators] = useState([])
  const [topCategories, setTopCategories] = useState([])
  const [loading, setLoading] = useState(true)

  const getWeekRange = () => {
    const now = new Date()
    const startOfWeek = new Date(now.getTime() - 7 * 86400000)
    return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
  }

  useEffect(() => {
    const fetchWeeklyData = async () => {
      setLoading(true)
      try {
        const startOfWeek = Date.now() - 7 * 86400000
        const snapshot = await firebase.db.collection("ai_tools").get()
        
        const allTools = []
        snapshot.forEach(doc => {
          allTools.push({ id: doc.id, ...doc.data() })
        })

        // Filter to this week's tools
        const weekTools = allTools.filter(t => (t.created_at || 0) >= startOfWeek)

        // Top tools by votes
        const byVotes = [...weekTools].sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0))
        setTopTools(byVotes.slice(0, 10))

        // Most discussed (by comment count)
        const byComments = [...weekTools].sort((a, b) => (b.comment_count || 0) - (a.comment_count || 0))
        setMostDiscussed(byComments.slice(0, 5))

        // Top creators this week
        const creatorMap = new Map()
        weekTools.forEach(tool => {
          const creatorId = tool.creator?.id || 'unknown'
          const creatorName = tool.creator?.name || 'Unknown'
          const avatar = tool.creator?.avatar || ''
          
          if (!creatorMap.has(creatorId)) {
            creatorMap.set(creatorId, { id: creatorId, name: creatorName, avatar, tools: 0, votes: 0 })
          }
          const creator = creatorMap.get(creatorId)
          creator.tools++
          creator.votes += (tool.upvotes || 0)
        })
        
        const creators = Array.from(creatorMap.values())
          .sort((a, b) => b.votes - a.votes)
          .slice(0, 5)
        setTopCreators(creators)

        // Top categories
        const categoryMap = new Map()
        weekTools.forEach(tool => {
          const cat = tool.category || 'other'
          categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1)
        })
        const categories = Array.from(categoryMap.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6)
        setTopCategories(categories)

      } catch (error) {
        console.error("Error fetching weekly data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchWeeklyData()
  }, [])

  return (
    <Layout
      title="Weekly Best - Top AI Tools This Week"
      description="Discover the best AI tools launched this week. See top voted tools, rising creators, and trending categories."
    >
      <Wrapper>
        <Header>
          <Title>📅 Weekly Best</Title>
          <Subtitle>The best AI tools launched this week</Subtitle>
          <WeekLabel>{getWeekRange()}</WeekLabel>
        </Header>

        {loading ? (
          <LoadingState>
            <div className="spinner" />
          </LoadingState>
        ) : (
          <Grid>
            <MainSection>
              <Section>
                <SectionTitle>🏆 Top Voted This Week</SectionTitle>
                {topTools.length === 0 ? (
                  <EmptyState>No tools launched this week yet.</EmptyState>
                ) : (
                  <ToolList>
                    {topTools.map((tool, index) => (
                      <RankedItem key={tool.id}>
                        <RankBadge rank={index + 1}>{index + 1}</RankBadge>
                        <ToolCardWrapper>
                          <AIToolCard tool={tool} />
                        </ToolCardWrapper>
                      </RankedItem>
                    ))}
                  </ToolList>
                )}
              </Section>

              {mostDiscussed.length > 0 && (
                <Section>
                  <SectionTitle>💬 Most Discussed</SectionTitle>
                  <ToolList>
                    {mostDiscussed.map(tool => (
                      <AIToolCard key={tool.id} tool={tool} />
                    ))}
                  </ToolList>
                </Section>
              )}
            </MainSection>

            <Sidebar>
              <Card>
                <CardTitle>⭐ Rising Creators</CardTitle>
                {topCreators.length === 0 ? (
                  <p style={{ color: '#667190', fontSize: '0.875rem' }}>No creators this week yet.</p>
                ) : (
                  topCreators.map(creator => (
                    <Link key={creator.id} href={`/creator/${creator.id}`}>
                      <a style={{ textDecoration: 'none' }}>
                        <CreatorItem>
                          <CreatorAvatar src={creator.avatar}>
                            {!creator.avatar && creator.name[0]?.toUpperCase()}
                          </CreatorAvatar>
                          <CreatorInfo>
                            <CreatorName>{creator.name}</CreatorName>
                            <CreatorStats>
                              {creator.tools} tool{creator.tools !== 1 ? 's' : ''} · {creator.votes} votes
                            </CreatorStats>
                          </CreatorInfo>
                        </CreatorItem>
                      </a>
                    </Link>
                  ))
                )}
              </Card>

              <Card>
                <CardTitle>📊 Trending Categories</CardTitle>
                <div>
                  {topCategories.map(([cat, count]) => (
                    <Link key={cat} href={`/category/${cat}`}>
                      <a style={{ textDecoration: 'none' }}>
                        <CategoryTag>
                          {cat} ({count})
                        </CategoryTag>
                      </a>
                    </Link>
                  ))}
                </div>
              </Card>

              <Card>
                <CardTitle>🚀 Submit Your Tool</CardTitle>
                <p style={{ fontSize: '0.875rem', color: '#667190', margin: '0 0 1rem 0' }}>
                  Launch your AI tool and compete for the top spot next week!
                </p>
                <Link href="/posts/new">
                  <a style={{
                    display: 'block',
                    textAlign: 'center',
                    padding: '0.75rem',
                    background: 'linear-gradient(135deg, #ff6154 0%, #ff9a8b 100%)',
                    color: 'white',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: '500',
                  }}>
                    Submit Now
                  </a>
                </Link>
              </Card>
            </Sidebar>
          </Grid>
        )}
      </Wrapper>
    </Layout>
  )
}
