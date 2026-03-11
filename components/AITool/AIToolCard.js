import { useState, useEffect, useContext } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import styled from "@emotion/styled"
import { default as formatTimeToNow } from "date-fns/formatDistanceToNow"
import { enUS } from "date-fns/locale"

import { FirebaseContext } from "../../firebase/index"
import { getCategoryById } from "../../utils/categories"
import { upvoteTool } from "../../firebase/utils"

const ToolItem = styled.li`
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  position: relative;
  border-radius: 8px;
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    cursor: pointer;
  }

  ${props => props.featured && `
    border: 2px solid var(--orange);
    background: linear-gradient(135deg, #fff9f8 0%, #fff 100%);
  `}
`

const ToolDescription = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: 80px 1fr;
  gap: 1.5rem;

  @media (max-width: 480px) {
    gap: 1rem;
    grid-template-columns: 60px 1fr;
  }
`

const ToolDetails = styled.div`
  padding: 0.25rem 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
`

const Tagline = styled.p`
  font-size: 0.95rem;
  margin: 0;
  color: #667190;

  @media (max-width: 480px) {
    font-size: 13px;
  }
`

const Title = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.35rem 0;
  color: #21293c;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  @media (max-width: 480px) {
    font-size: 13px;
  }
`

const FeaturedBadge = styled.span`
  background: linear-gradient(135deg, #ff6154 0%, #ff9a8b 100%);
  color: white;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
`

const LogoContainer = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 12px;
  overflow: hidden;
  background-color: #f5f5f5;
  flex-shrink: 0;

  @media (max-width: 480px) {
    width: 60px;
    height: 60px;
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
  font-size: 1.5rem;
  font-weight: bold;
`

const MetaInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.5rem;
  flex-wrap: wrap;

  @media (max-width: 480px) {
    display: none;
  }
`

const CategoryBadge = styled.span`
  background-color: #eef2ff;
  color: #4b587c;
  font-size: 12px;
  font-weight: 500;
  padding: 3px 8px;
  border-radius: 12px;
`

const Tags = styled.span`
  color: #667190;
  font-size: 13px;
`

const TimeAgo = styled.span`
  font-size: 13px;
  color: #9ca3af;
`

const Separator = styled.span`
  color: #d1d5db;
  font-size: 12px;
`

const UpvoteButton = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background-color: #fff;
  border: 1px solid ${props => props.upvoted ? "var(--orange)" : "#e5e7eb"};
  padding: 0.75rem 1rem;
  border-radius: 8px;
  min-width: 60px;
  transition: all 0.2s ease;

  ${props => props.upvoted && `
    background-color: #fff5f4;
    border-color: var(--orange);
  `}

  &:hover {
    border-color: var(--orange);
    background-color: #fff5f4;
  }

  @media (max-width: 480px) {
    border: none;
    border-radius: 0px;
    border-left: 1px solid #e5e7eb;
    padding: 0.5rem;
  }
`

const UpvoteIcon = styled.div`
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 10px solid ${props => props.upvoted ? "var(--orange)" : "#667190"};
  margin-bottom: 4px;
  transition: border-color 0.2s ease;
`

const UpvoteCount = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.upvoted ? "var(--orange)" : "#21293c"};
  transition: color 0.2s ease;
`

const UpvoteWrapper = styled.div`
  position: relative;
`

const VoteErrorTooltip = styled.div`
  position: absolute;
  bottom: 100%;
  right: 0;
  margin-bottom: 8px;
  padding: 8px 12px;
  background: #991b1b;
  color: white;
  font-size: 12px;
  border-radius: 6px;
  white-space: nowrap;
  animation: fadeIn 0.2s ease;
  z-index: 100;

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    right: 20px;
    border: 6px solid transparent;
    border-top-color: #991b1b;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
  }
`

export default function AIToolCard({ tool, showCategory = true }) {
  const {
    id,
    name,
    tagline,
    logo_url,
    upvotes = 0,
    tags = [],
    category,
    created_at,
    hasVoted = [],
    slug,
    featured = false,
  } = tool

  const [upvoted, setUpvoted] = useState(false)
  const [currentUpvotes, setCurrentUpvotes] = useState(upvotes)
  const [logoError, setLogoError] = useState(false)
  const [logoLoading, setLogoLoading] = useState(true)
  const [voteLoading, setVoteLoading] = useState(false)
  const [voteError, setVoteError] = useState("")

  const router = useRouter()
  const { user, firebase } = useContext(FirebaseContext)

  const categoryInfo = getCategoryById(category)

  // Check if user has voted (hasVoted can contain strings or objects)
  const checkIfUserVoted = (hasVotedArray, userId) => {
    if (!hasVotedArray || !userId) return false
    return hasVotedArray.some(vote => {
      if (typeof vote === 'string') return vote === userId
      return vote.userId === userId
    })
  }

  useEffect(() => {
    if (user && hasVoted) {
      setUpvoted(checkIfUserVoted(hasVoted, user.uid))
    }
  }, [user, hasVoted])

  const handleLogoLoad = () => setLogoLoading(false)
  const handleLogoError = () => {
    setLogoError(true)
    setLogoLoading(false)
  }

  const handleUpvote = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      router.push("/signin")
      return
    }

    if (voteLoading) return

    setVoteLoading(true)
    setVoteError("")

    try {
      const result = await upvoteTool(id, user.uid)
      setUpvoted(result.voted)
      setCurrentUpvotes(result.upvotes)
    } catch (error) {
      setVoteError(error.message)
      // Show error briefly then clear
      setTimeout(() => setVoteError(""), 3000)
    } finally {
      setVoteLoading(false)
    }
  }

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Link href={`/tool/${slug}`} legacyBehavior>
      <ToolItem featured={featured}>
        <ToolDescription>
          <LogoContainer>
            {(logoLoading || logoError || !logo_url) ? (
              <LogoPlaceholder>{getInitials(name)}</LogoPlaceholder>
            ) : null}
            {logo_url && !logoError && (
              <Logo
                src={logo_url}
                alt={`${name} logo`}
                onLoad={handleLogoLoad}
                onError={handleLogoError}
                style={logoLoading ? { display: 'none' } : {}}
              />
            )}
          </LogoContainer>
          <ToolDetails>
            <Title>
              {name}
              {featured && <FeaturedBadge>Featured</FeaturedBadge>}
            </Title>
            <Tagline>{tagline}</Tagline>
            <MetaInfo>
              {showCategory && categoryInfo && (
                <>
                  <CategoryBadge>{categoryInfo.icon} {categoryInfo.name}</CategoryBadge>
                  <Separator>·</Separator>
                </>
              )}
              {tags && tags.length > 0 && (
                <>
                  <Tags>{tags.slice(0, 3).map(tag => `#${tag}`).join(' ')}</Tags>
                  <Separator>·</Separator>
                </>
              )}
              {created_at && (
                <TimeAgo>
                  {formatTimeToNow(new Date(created_at), { locale: enUS })} ago
                </TimeAgo>
              )}
            </MetaInfo>
          </ToolDetails>
        </ToolDescription>
        <UpvoteWrapper>
          {voteError && <VoteErrorTooltip>{voteError}</VoteErrorTooltip>}
          <UpvoteButton onClick={handleUpvote} upvoted={upvoted} style={voteLoading ? { opacity: 0.6 } : {}}>
            <UpvoteIcon upvoted={upvoted} />
            <UpvoteCount upvoted={upvoted}>{currentUpvotes}</UpvoteCount>
          </UpvoteButton>
        </UpvoteWrapper>
      </ToolItem>
    </Link>
  )
}
