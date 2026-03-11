import { useEffect, useState } from "react"
import Link from "next/link"
import styled from "@emotion/styled"
import { format } from "date-fns"

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

const PageHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`

const PageTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #21293c;
  margin: 0 0 1rem 0;

  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
`

const PageSubtitle = styled.p`
  font-size: 1.25rem;
  color: #667190;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`

const WinnerCard = styled.div`
  background: white;
  border: 2px solid #FFD700;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #FFD700, #FFA500, #FFD700);
  }
`

const WinnerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.5rem;
`

const WinnerDate = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #21293c;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const WinnerBadge = styled.span`
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 20px;
`

const WinnerStats = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.875rem;
  color: #667190;
`

const ToolWrapper = styled.div`
  & > a > li {
    border: 1px solid #e5e7eb;
    border-radius: 12px;
  }
`

const LoadingState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #667190;
`

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  background: #f9fafb;
  border-radius: 12px;
`

const LoadMoreButton = styled.button`
  display: block;
  width: 100%;
  max-width: 300px;
  margin: 2rem auto 0;
  padding: 0.875rem 1.5rem;
  background: var(--orange);
  color: white;
  font-weight: 600;
  font-size: 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 97, 84, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

// Helper to get dates for past days
const getPastDates = (numDays) => {
  const dates = []
  const today = new Date()
  
  for (let i = 1; i <= numDays; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    dates.push({
      start: new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime(),
      end: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1).getTime(),
      label: format(date, 'EEEE, MMMM d, yyyy')
    })
  }
  
  return dates
}

export default function WinnersPage() {
  const [winners, setWinners] = useState([])
  const [loading, setLoading] = useState(true)
  const [daysToShow, setDaysToShow] = useState(7)

  useEffect(() => {
    const fetchWinners = async () => {
      setLoading(true)
      try {
        const allToolsSnapshot = await firebase.db
          .collection("ai_tools")
          .get()

        const allTools = []
        allToolsSnapshot.forEach(doc => {
          allTools.push({ id: doc.id, ...doc.data() })
        })

        const dates = getPastDates(daysToShow)
        const winnersData = []

        for (const date of dates) {
          const dayTools = allTools
            .filter(t => {
              const createdAt = t.created_at || 0
              return createdAt >= date.start && createdAt < date.end
            })
            .sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0))

          if (dayTools.length > 0) {
            winnersData.push({
              date: date.label,
              winner: dayTools[0],
              totalLaunches: dayTools.length
            })
          }
        }

        setWinners(winnersData)
      } catch (error) {
        console.error("Error fetching winners:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchWinners()
  }, [daysToShow])

  const loadMore = () => {
    setDaysToShow(prev => prev + 7)
  }

  return (
    <Layout
      title="Daily Winners - AI Tools Hall of Fame"
      description="See the top AI tools that won each day. The Hall of Fame showcases the best AI products as voted by our community."
    >
      <Wrapper>
        <PageHeader>
          <PageTitle>🏆 Daily Winners</PageTitle>
          <PageSubtitle>
            The #1 ranked AI tool for each day - as voted by the community
          </PageSubtitle>
        </PageHeader>

        {loading && winners.length === 0 && (
          <LoadingState>
            <p style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</p>
            <p>Loading winners...</p>
          </LoadingState>
        )}

        {!loading && winners.length === 0 && (
          <EmptyState>
            <p style={{ fontSize: '2rem', marginBottom: '1rem' }}>🏆</p>
            <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>No winners yet</p>
            <p>Be the first to <Link href="/posts/new" style={{ color: 'var(--orange)' }}>launch a tool</Link> and claim the crown!</p>
          </EmptyState>
        )}

        {winners.map((day, index) => (
          <WinnerCard key={index}>
            <WinnerHeader>
              <WinnerDate>
                🏆 {day.date}
              </WinnerDate>
              <WinnerStats>
                <WinnerBadge>#1 of {day.totalLaunches} launches</WinnerBadge>
                <span>🔺 {day.winner.upvotes || 0} upvotes</span>
              </WinnerStats>
            </WinnerHeader>
            <ToolWrapper>
              <AIToolCard tool={day.winner} />
            </ToolWrapper>
          </WinnerCard>
        ))}

        {winners.length > 0 && (
          <LoadMoreButton onClick={loadMore} disabled={loading}>
            {loading ? 'Loading...' : 'Load More Winners'}
          </LoadMoreButton>
        )}
      </Wrapper>
    </Layout>
  )
}
