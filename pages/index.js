import { useEffect, useState } from "react"
import Link from "next/link"
import styled from "@emotion/styled"

import Layout from "@components/Layout/Layout"
import { AIToolCard, AIToolListSkeleton, CategorySection } from "@components/AITool"
import firebase from "../firebase/index"
import { CATEGORIES } from "../utils/categories"

const Wrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`

const Hero = styled.section`
  text-align: center;
  padding: 3rem 1rem;
  margin-bottom: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  color: white;
`

const HeroTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 1rem 0;

  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
`

const HeroSubtitle = styled.p`
  font-size: 1.25rem;
  opacity: 0.9;
  margin: 0 auto 2rem auto;
  max-width: 600px;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`

const SubmitButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 2rem;
  background: white;
  color: #764ba2;
  font-weight: 600;
  font-size: 1rem;
  border-radius: 8px;
  text-decoration: none;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  }
`

const CountdownSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
  font-size: 0.95rem;
  opacity: 0.9;
`

const CountdownTimer = styled.span`
  font-family: monospace;
  font-size: 1.1rem;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
`

const Section = styled.section`
  margin-bottom: 3rem;
`

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
`

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #21293c;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const ViewAllLink = styled.a`
  color: var(--orange);
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.25rem;

  &:hover {
    text-decoration: underline;
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

const EmptyState = styled.p`
  text-align: center;
  color: #667190;
  padding: 2rem;
  background: #f9fafb;
  border-radius: 8px;
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
  
  @media (max-width: 480px) {
    min-width: 32px;
    font-size: 0.875rem;
  }
`

const ToolCardWrapper = styled.div`
  flex: 1;
  
  & > a > li {
    border-radius: 0 8px 8px 0;
  }
`

const QuickStats = styled.div`
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
  color: var(--orange);
  margin-bottom: 0.25rem;
`

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #667190;
`

const CTASection = styled.section`
  background: linear-gradient(135deg, #ff6154 0%, #ff9a8b 100%);
  border-radius: 16px;
  padding: 3rem 2rem;
  text-align: center;
  color: white;
  margin-bottom: 3rem;
`

const CTATitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
`

const CTASubtitle = styled.p`
  font-size: 1.1rem;
  opacity: 0.95;
  margin: 0 auto 1.5rem auto;
  max-width: 500px;
`

const CTAButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 2rem;
  background: white;
  color: #ff6154;
  font-weight: 600;
  font-size: 1rem;
  border-radius: 8px;
  text-decoration: none;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  }
`

// Helper to get time boundaries
const getTimeBoundaries = () => {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const startOfYesterday = startOfToday - 86400000
  const startOfWeek = startOfToday - 7 * 86400000
  const startOfMonth = startOfToday - 30 * 86400000
  
  return { startOfToday, startOfYesterday, startOfWeek, startOfMonth }
}

// Helper to calculate time until midnight
const getTimeUntilMidnight = () => {
  const now = new Date()
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  const diff = midnight - now
  
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

// Ranked Tool Component
const RankedTool = ({ tool, rank }) => (
  <RankedToolWrapper>
    <RankBadge rank={rank}>{rank}</RankBadge>
    <ToolCardWrapper>
      <AIToolCard tool={tool} />
    </ToolCardWrapper>
  </RankedToolWrapper>
)

export default function Home() {
  const [todayTools, setTodayTools] = useState([])
  const [yesterdayTools, setYesterdayTools] = useState([])
  const [weekTools, setWeekTools] = useState([])
  const [monthTools, setMonthTools] = useState([])
  const [totalTools, setTotalTools] = useState(0)
  const [loading, setLoading] = useState(true)
  const [countdown, setCountdown] = useState("")

  // Countdown timer
  useEffect(() => {
    const updateCountdown = () => setCountdown(getTimeUntilMidnight())
    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [])

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

        setTotalTools(allTools.length)

        const { startOfToday, startOfYesterday, startOfWeek, startOfMonth } = getTimeBoundaries()

        // Today's launches - sorted by upvotes (daily competition)
        const today = allTools
          .filter(t => (t.created_at || 0) >= startOfToday)
          .sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0))
          .slice(0, 10)
        setTodayTools(today)

        // Yesterday's launches
        const yesterday = allTools
          .filter(t => (t.created_at || 0) >= startOfYesterday && (t.created_at || 0) < startOfToday)
          .sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0))
          .slice(0, 5)
        setYesterdayTools(yesterday)

        // Last week's top
        const week = allTools
          .filter(t => (t.created_at || 0) >= startOfWeek)
          .sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0))
          .slice(0, 10)
        setWeekTools(week)

        // Last month's top
        const month = allTools
          .filter(t => (t.created_at || 0) >= startOfMonth)
          .sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0))
          .slice(0, 10)
        setMonthTools(month)

      } catch (error) {
        console.error("Error fetching tools:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTools()
  }, [])

  return (
    <Layout
      title="Launch Your AI Tool & Get Discovered"
      description="The #1 platform to launch your AI tool. Get upvotes, backlinks, and reach thousands of AI enthusiasts. Submit your AI startup today."
      keywords="AI tools directory, launch AI tool, AI startup, submit AI tool, AI tools launchpad"
    >
      <Wrapper>
        {/* Hero Section */}
        <Hero>
          <HeroTitle>🚀 Launch Your AI Tool & Boost Your Online Presence</HeroTitle>
          <HeroSubtitle>
            Submit your AI tool, get upvotes, high-quality backlinks, and reach thousands of AI enthusiasts. Launch in seconds!
          </HeroSubtitle>
          <Link href="/posts/new" passHref legacyBehavior>
            <SubmitButton>
              ✨ Submit Your AI Tool
            </SubmitButton>
          </Link>
          <CountdownSection>
            <span>🕐 New launches in</span>
            <CountdownTimer>{countdown}</CountdownTimer>
          </CountdownSection>
        </Hero>

        {/* Quick Stats */}
        <QuickStats>
          <StatCard>
            <StatNumber>{totalTools}</StatNumber>
            <StatLabel>AI Tools Listed</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>{todayTools.length}</StatNumber>
            <StatLabel>Launched Today</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>{CATEGORIES.length}</StatNumber>
            <StatLabel>Categories</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>Free</StatNumber>
            <StatLabel>To Submit</StatLabel>
          </StatCard>
        </QuickStats>

        {/* Today's Launches */}
        <Section id="today-section">
          <SectionHeader>
            <SectionTitle>🏆 Top Projects Launching Today</SectionTitle>
            <Link href="/trending?filter=today" passHref legacyBehavior>
              <ViewAllLink>View all →</ViewAllLink>
            </Link>
          </SectionHeader>
          <ToolList>
            {loading && <AIToolListSkeleton count={5} loading={true} />}
            {!loading && todayTools.length === 0 && (
              <EmptyState>No launches today yet. Be the first to launch! 🚀</EmptyState>
            )}
            {!loading && todayTools.map((tool, index) => (
              <RankedTool key={tool.id} tool={tool} rank={index + 1} />
            ))}
          </ToolList>
        </Section>

        {/* Yesterday's Launches */}
        {yesterdayTools.length > 0 && (
          <Section>
            <SectionHeader>
              <SectionTitle>📅 Yesterday's Top Launches</SectionTitle>
              <Link href="/trending?filter=yesterday" passHref legacyBehavior>
                <ViewAllLink>View all →</ViewAllLink>
              </Link>
            </SectionHeader>
            <ToolList>
              {yesterdayTools.map((tool, index) => (
                <RankedTool key={tool.id} tool={tool} rank={index + 1} />
              ))}
            </ToolList>
          </Section>
        )}

        {/* This Week's Top */}
        <Section>
          <SectionHeader>
            <SectionTitle>🔥 This Week's Top</SectionTitle>
            <Link href="/trending?filter=week" passHref legacyBehavior>
              <ViewAllLink>View all →</ViewAllLink>
            </Link>
          </SectionHeader>
          <ToolList>
            {loading && <AIToolListSkeleton count={5} loading={true} />}
            {!loading && weekTools.length === 0 && (
              <EmptyState>No tools launched this week yet.</EmptyState>
            )}
            {!loading && weekTools.slice(0, 5).map((tool, index) => (
              <RankedTool key={tool.id} tool={tool} rank={index + 1} />
            ))}
          </ToolList>
        </Section>

        {/* This Month's Top */}
        <Section>
          <SectionHeader>
            <SectionTitle>📊 This Month's Top</SectionTitle>
            <Link href="/trending?filter=month" passHref legacyBehavior>
              <ViewAllLink>View all →</ViewAllLink>
            </Link>
          </SectionHeader>
          <ToolList>
            {loading && <AIToolListSkeleton count={5} loading={true} />}
            {!loading && monthTools.length === 0 && (
              <EmptyState>No tools launched this month yet.</EmptyState>
            )}
            {!loading && monthTools.slice(0, 5).map((tool, index) => (
              <RankedTool key={tool.id} tool={tool} rank={index + 1} />
            ))}
          </ToolList>
        </Section>

        {/* CTA Section */}
        <CTASection>
          <CTATitle>🎯 Ready to Launch Your AI Tool?</CTATitle>
          <CTASubtitle>
            Join hundreds of founders who've launched their AI tools here. Get exposure, backlinks, and real users.
          </CTASubtitle>
          <Link href="/posts/new" passHref legacyBehavior>
            <CTAButton>
              🚀 Submit Now - It's Free
            </CTAButton>
          </Link>
        </CTASection>

        {/* Categories Section */}
        <CategorySection categories={CATEGORIES} title="🗂️ Browse by Category" />
      </Wrapper>
    </Layout>
  )
}
