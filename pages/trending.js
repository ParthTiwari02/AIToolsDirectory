import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import styled from "@emotion/styled"

import Layout from "@components/Layout/Layout"
import { AIToolCard, AIToolListSkeleton } from "@components/AITool"
import firebase from "../firebase/index"

const Wrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`

const PageHeader = styled.div`
  margin-bottom: 2rem;
`

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #21293c;
  margin: 0 0 0.5rem 0;
`

const PageSubtitle = styled.p`
  font-size: 1rem;
  color: #667190;
  margin: 0;
`

const FilterTabs = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`

const FilterTab = styled.button`
  padding: 0.625rem 1.25rem;
  border: 1px solid ${props => props.$active ? 'var(--orange)' : '#e5e7eb'};
  border-radius: 8px;
  font-size: 14px;
  font-weight: ${props => props.$active ? '600' : '400'};
  color: ${props => props.$active ? 'var(--orange)' : '#4b587c'};
  background-color: ${props => props.$active ? '#fff5f4' : '#fff'};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--orange);
    color: var(--orange);
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
  color: #667190;
  padding: 3rem;
  background: #f9fafb;
  border-radius: 12px;
`

const RankedToolWrapper = styled.div`
  display: flex;
  align-items: stretch;
  gap: 0;
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
  font-size: 1rem;
  border-radius: 8px 0 0 8px;
`

const ToolCardWrapper = styled.div`
  flex: 1;
  
  & > a > li {
    border-radius: 0 8px 8px 0;
  }
`

const ResultsCount = styled.p`
  font-size: 0.875rem;
  color: #667190;
  margin-bottom: 1.5rem;
`

const FILTERS = [
  { key: 'today', label: '🔥 Today', title: "Today's Top Launches" },
  { key: 'yesterday', label: '📅 Yesterday', title: "Yesterday's Top Launches" },
  { key: 'week', label: '📊 This Week', title: "This Week's Top" },
  { key: 'month', label: '📈 This Month', title: "This Month's Top" },
  { key: 'all', label: '🌟 All Time', title: "All Time Top" },
]

// Helper to get time boundaries
const getTimeBoundaries = () => {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const startOfYesterday = startOfToday - 86400000
  const startOfWeek = startOfToday - 7 * 86400000
  const startOfMonth = startOfToday - 30 * 86400000
  
  return { startOfToday, startOfYesterday, startOfWeek, startOfMonth }
}

const RankedTool = ({ tool, rank }) => (
  <RankedToolWrapper>
    <RankBadge rank={rank}>{rank}</RankBadge>
    <ToolCardWrapper>
      <AIToolCard tool={tool} />
    </ToolCardWrapper>
  </RankedToolWrapper>
)

export default function TrendingPage() {
  const router = useRouter()
  const { filter = 'today' } = router.query
  
  const [tools, setTools] = useState([])
  const [loading, setLoading] = useState(true)

  const currentFilter = FILTERS.find(f => f.key === filter) || FILTERS[0]

  useEffect(() => {
    const fetchTools = async () => {
      setLoading(true)
      try {
        const allToolsSnapshot = await firebase.db
          .collection("ai_tools")
          .get()

        const allTools = []
        allToolsSnapshot.forEach(doc => {
          allTools.push({ id: doc.id, ...doc.data() })
        })

        const { startOfToday, startOfYesterday, startOfWeek, startOfMonth } = getTimeBoundaries()

        let filteredTools = allTools

        switch (filter) {
          case 'today':
            filteredTools = allTools.filter(t => (t.created_at || 0) >= startOfToday)
            break
          case 'yesterday':
            filteredTools = allTools.filter(t => 
              (t.created_at || 0) >= startOfYesterday && (t.created_at || 0) < startOfToday
            )
            break
          case 'week':
            filteredTools = allTools.filter(t => (t.created_at || 0) >= startOfWeek)
            break
          case 'month':
            filteredTools = allTools.filter(t => (t.created_at || 0) >= startOfMonth)
            break
          default:
            filteredTools = allTools
        }

        // Sort by upvotes
        filteredTools.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0))
        
        setTools(filteredTools)
      } catch (error) {
        console.error("Error fetching tools:", error)
      } finally {
        setLoading(false)
      }
    }

    if (router.isReady) {
      fetchTools()
    }
  }, [filter, router.isReady])

  const handleFilterChange = (newFilter) => {
    router.push(`/trending?filter=${newFilter}`, undefined, { shallow: true })
  }

  return (
    <Layout
      title={`${currentFilter.title} - AI Tools Directory`}
      description={`Discover the ${currentFilter.title.toLowerCase()} AI tools. Browse trending AI tools ranked by community votes.`}
    >
      <Wrapper>
        <PageHeader>
          <PageTitle>🚀 {currentFilter.title}</PageTitle>
          <PageSubtitle>
            Discover the top AI tools ranked by community votes
          </PageSubtitle>
        </PageHeader>

        <FilterTabs>
          {FILTERS.map(f => (
            <FilterTab
              key={f.key}
              type="button"
              $active={filter === f.key}
              onClick={() => handleFilterChange(f.key)}
            >
              {f.label}
            </FilterTab>
          ))}
        </FilterTabs>

        {!loading && <ResultsCount>{tools.length} tool{tools.length !== 1 ? 's' : ''} found</ResultsCount>}

        <ToolList>
          {loading && <AIToolListSkeleton count={10} loading={true} />}
          {!loading && tools.length === 0 && (
            <EmptyState>
              <p style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔍</p>
              <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>No tools found for this period</p>
              <p>Be the first to <Link href="/posts/new" style={{ color: 'var(--orange)' }}>submit a tool</Link>!</p>
            </EmptyState>
          )}
          {!loading && tools.map((tool, index) => (
            <RankedTool key={tool.id} tool={tool} rank={index + 1} />
          ))}
        </ToolList>
      </Wrapper>
    </Layout>
  )
}
