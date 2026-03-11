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

const TabsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`

const Tab = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.active ? 'linear-gradient(135deg, #ff6154 0%, #ff9a8b 100%)' : '#f3f4f6'};
  color: ${props => props.active ? 'white' : '#667190'};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`

const Section = styled.section`
  margin-bottom: 3rem;
`

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #21293c;
  margin: 0 0 1.5rem 0;
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
  gap: 0;
`

const RankBadge = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 50px;
  background: ${props => {
    if (props.rank === 1) return 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
    if (props.rank === 2) return 'linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%)'
    if (props.rank === 3) return 'linear-gradient(135deg, #CD7F32 0%, #8B4513 100%)'
    return '#f3f4f6'
  }};
  color: ${props => props.rank <= 3 ? 'white' : '#667190'};
  font-weight: 700;
  font-size: 1.25rem;
  border-radius: 12px 0 0 12px;
`

const ToolCardWrapper = styled.div`
  flex: 1;
  
  & > a > li {
    border-radius: 0 12px 12px 0;
  }
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

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 3rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`

const StatCard = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
`

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${props => props.color || '#ff6154'};
`

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #667190;
`

// Helper functions
const getTimeBoundaries = () => {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const startOfWeek = startOfToday - 7 * 86400000
  const startOfMonth = startOfToday - 30 * 86400000
  return { startOfToday, startOfWeek, startOfMonth }
}

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState('today')
  const [tools, setTools] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, today: 0, week: 0, votes: 0 })

  useEffect(() => {
    const fetchTools = async () => {
      setLoading(true)
      try {
        const snapshot = await firebase.db.collection("ai_tools").get()
        const allTools = []
        snapshot.forEach(doc => {
          allTools.push({ id: doc.id, ...doc.data() })
        })

        const { startOfToday, startOfWeek, startOfMonth } = getTimeBoundaries()

        // Calculate stats
        const todayTools = allTools.filter(t => (t.created_at || 0) >= startOfToday)
        const weekTools = allTools.filter(t => (t.created_at || 0) >= startOfWeek)
        const totalVotes = allTools.reduce((sum, t) => sum + (t.upvotes || 0), 0)

        setStats({
          total: allTools.length,
          today: todayTools.length,
          week: weekTools.length,
          votes: totalVotes,
        })

        // Filter and sort based on active tab
        let filtered = []
        switch (activeTab) {
          case 'today':
            filtered = allTools
              .filter(t => (t.created_at || 0) >= startOfToday)
              .sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0))
            break
          case 'week':
            filtered = allTools
              .filter(t => (t.created_at || 0) >= startOfWeek)
              .sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0))
            break
          case 'month':
            filtered = allTools
              .filter(t => (t.created_at || 0) >= startOfMonth)
              .sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0))
            break
          case 'alltime':
          default:
            filtered = allTools.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0))
        }

        setTools(filtered.slice(0, 50))
      } catch (error) {
        console.error("Error fetching leaderboard:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTools()
  }, [activeTab])

  const tabLabels = {
    today: "🏆 Today's Top",
    week: "🔥 This Week",
    month: "📊 This Month",
    alltime: "👑 All Time"
  }

  return (
    <Layout
      title="Leaderboard - Top AI Tools"
      description="Discover the most popular AI tools. See what's trending today, this week, and all time."
    >
      <Wrapper>
        <Header>
          <Title>🏆 Leaderboard</Title>
          <Subtitle>Discover the most popular AI tools ranked by community votes</Subtitle>
        </Header>

        <StatsGrid>
          <StatCard>
            <StatNumber>{stats.total}</StatNumber>
            <StatLabel>Total Tools</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber color="#10b981">{stats.today}</StatNumber>
            <StatLabel>Launched Today</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber color="#6366f1">{stats.week}</StatNumber>
            <StatLabel>This Week</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber color="#f59e0b">{stats.votes.toLocaleString()}</StatNumber>
            <StatLabel>Total Votes</StatLabel>
          </StatCard>
        </StatsGrid>

        <TabsContainer>
          {Object.entries(tabLabels).map(([key, label]) => (
            <Tab
              key={key}
              active={activeTab === key}
              onClick={() => setActiveTab(key)}
            >
              {label}
            </Tab>
          ))}
        </TabsContainer>

        <Section>
          <SectionTitle>{tabLabels[activeTab]}</SectionTitle>
          
          {loading ? (
            <LoadingState>
              <div className="spinner" />
            </LoadingState>
          ) : tools.length === 0 ? (
            <EmptyState>
              <p>No tools found for this period.</p>
              <Link href="/posts/new">
                <a style={{ color: '#ff6154', fontWeight: 500 }}>Be the first to launch!</a>
              </Link>
            </EmptyState>
          ) : (
            <ToolList>
              {tools.map((tool, index) => (
                <RankedItem key={tool.id}>
                  <RankBadge rank={index + 1}>#{index + 1}</RankBadge>
                  <ToolCardWrapper>
                    <AIToolCard tool={tool} />
                  </ToolCardWrapper>
                </RankedItem>
              ))}
            </ToolList>
          )}
        </Section>
      </Wrapper>
    </Layout>
  )
}
