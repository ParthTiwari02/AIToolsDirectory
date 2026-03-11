import { useEffect, useState, useContext } from "react"
import { useRouter } from "next/router"
import styled from "@emotion/styled"
import Layout from "@components/Layout/Layout"
import { AIToolCard } from "@components/AITool"
import firebase from "../../firebase/index"
import FirebaseContext from "../../firebase/context"

const Wrapper = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`

const ProfileHeader = styled.div`
  display: flex;
  gap: 2rem;
  margin-bottom: 3rem;
  padding: 2rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 1rem;
  }
`

const Avatar = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: ${props => props.src ? `url(${props.src}) center/cover` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: white;
  flex-shrink: 0;
`

const ProfileInfo = styled.div`
  flex: 1;
`

const CreatorName = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #21293c;
  margin: 0 0 0.5rem 0;
`

const CreatorBio = styled.p`
  color: #667190;
  font-size: 1rem;
  margin: 0 0 1rem 0;
  line-height: 1.6;
`

const StatsRow = styled.div`
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    justify-content: center;
  }
`

const Stat = styled.div`
  text-align: center;
`

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #ff6154;
`

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #667190;
`

const BadgesSection = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    justify-content: center;
  }
`

const FollowButton = styled.button`
  padding: 0.5rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 1rem;
  
  ${props => props.isFollowing ? `
    background: #f3f4f6;
    color: #667190;
    border: 1px solid #e5e7eb;
    
    &:hover {
      background: #fee2e2;
      color: #dc2626;
      border-color: #fecaca;
    }
  ` : `
    background: linear-gradient(135deg, #ff6154 0%, #ff8c42 100%);
    color: white;
    border: none;
    box-shadow: 0 4px 12px rgba(255, 97, 84, 0.3);
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(255, 97, 84, 0.4);
    }
  `}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`

const FollowerCount = styled.span`
  font-size: 0.75rem;
  color: #667190;
  margin-left: 0.5rem;
`

const Badge = styled.span`
  padding: 0.25rem 0.75rem;
  background: ${props => props.color || '#f3f4f6'};
  color: ${props => props.textColor || '#667190'};
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 20px;
`

const Section = styled.section`
  margin-bottom: 2rem;
`

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #21293c;
  margin: 0 0 1rem 0;
`

const ToolList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
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

// Badge definitions
const BADGES = {
  early_launcher: { emoji: '🚀', name: 'Early Launcher', color: '#dcfce7', textColor: '#166534' },
  trending_tool: { emoji: '🔥', name: 'Trending Tool', color: '#fef3c7', textColor: '#92400e' },
  top_creator: { emoji: '⭐', name: 'Top Creator', color: '#fce7f3', textColor: '#be185d' },
  community_favorite: { emoji: '🧠', name: 'Community Favorite', color: '#e0e7ff', textColor: '#4338ca' },
  prolific_maker: { emoji: '🏭', name: 'Prolific Maker', color: '#f3e8ff', textColor: '#7c3aed' },
}

function calculateBadges(tools, totalVotes) {
  const badges = []
  
  if (tools.length >= 1) badges.push('early_launcher')
  if (tools.length >= 5) badges.push('prolific_maker')
  if (totalVotes >= 100) badges.push('top_creator')
  if (totalVotes >= 500) badges.push('community_favorite')
  if (tools.some(t => (t.upvotes || 0) >= 50)) badges.push('trending_tool')
  
  return badges
}

export default function CreatorProfile() {
  const router = useRouter()
  const { username } = router.query
  const { user } = useContext(FirebaseContext)
  
  const [creator, setCreator] = useState(null)
  const [tools, setTools] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followerCount, setFollowerCount] = useState(0)
  const [followLoading, setFollowLoading] = useState(false)

  useEffect(() => {
    if (!username) return

    const fetchCreatorData = async () => {
      setLoading(true)
      setNotFound(false)

      try {
        // Search for tools by this creator
        const snapshot = await firebase.db
          .collection("ai_tools")
          .where("creator.id", "==", username)
          .get()

        if (snapshot.empty) {
          // Try searching by creator name
          const byNameSnapshot = await firebase.db.collection("ai_tools").get()
          const toolsByName = []
          byNameSnapshot.forEach(doc => {
            const data = doc.data()
            if (data.creator?.name?.toLowerCase().replace(/\s+/g, '-') === username.toLowerCase()) {
              toolsByName.push({ id: doc.id, ...data })
            }
          })

          if (toolsByName.length === 0) {
            setNotFound(true)
            setLoading(false)
            return
          }

          setTools(toolsByName.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0)))
          setCreator({
            id: username,
            name: toolsByName[0].creator?.name || 'Unknown Creator',
            avatar: toolsByName[0].creator?.avatar || '',
            bio: '',
          })
        } else {
          const creatorTools = []
          snapshot.forEach(doc => {
            creatorTools.push({ id: doc.id, ...doc.data() })
          })

          setTools(creatorTools.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0)))
          setCreator({
            id: creatorTools[0].creator?.id || username,
            name: creatorTools[0].creator?.name || 'Unknown Creator',
            avatar: creatorTools[0].creator?.avatar || '',
            bio: '',
          })
        }
      } catch (error) {
        console.error("Error fetching creator:", error)
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }

    fetchCreatorData()
  }, [username])

  // Check if current user is following this creator
  useEffect(() => {
    if (!user || !username) return

    const checkFollowStatus = async () => {
      try {
        const followDoc = await firebase.db
          .collection("follows")
          .doc(`${user.uid}_${username}`)
          .get()
        setIsFollowing(followDoc.exists)
      } catch (error) {
        console.error("Error checking follow status:", error)
      }
    }

    checkFollowStatus()
  }, [user, username])

  // Get follower count
  useEffect(() => {
    if (!username) return

    const getFollowerCount = async () => {
      try {
        const snapshot = await firebase.db
          .collection("follows")
          .where("creatorId", "==", username)
          .get()
        setFollowerCount(snapshot.size)
      } catch (error) {
        console.error("Error getting follower count:", error)
      }
    }

    getFollowerCount()
  }, [username])

  const handleFollow = async () => {
    if (!user) {
      router.push('/signin')
      return
    }

    setFollowLoading(true)
    const followId = `${user.uid}_${username}`

    try {
      if (isFollowing) {
        // Unfollow
        await firebase.db.collection("follows").doc(followId).delete()
        setIsFollowing(false)
        setFollowerCount(prev => Math.max(0, prev - 1))
      } else {
        // Follow
        await firebase.db.collection("follows").doc(followId).set({
          followerId: user.uid,
          followerName: user.displayName || 'Anonymous',
          creatorId: username,
          creatorName: creator?.name || username,
          created_at: Date.now()
        })
        setIsFollowing(true)
        setFollowerCount(prev => prev + 1)
      }
    } catch (error) {
      console.error("Error updating follow:", error)
    } finally {
      setFollowLoading(false)
    }
  }

  const totalVotes = tools.reduce((sum, t) => sum + (t.upvotes || 0), 0)
  const badges = calculateBadges(tools, totalVotes)

  if (loading) {
    return (
      <Layout title="Loading Creator Profile...">
        <Wrapper>
          <LoadingState>
            <div className="spinner" />
          </LoadingState>
        </Wrapper>
      </Layout>
    )
  }

  if (notFound) {
    return (
      <Layout title="Creator Not Found">
        <Wrapper>
          <NotFound>
            <h1>Creator Not Found</h1>
            <p>We couldn't find a creator with this username.</p>
          </NotFound>
        </Wrapper>
      </Layout>
    )
  }

  return (
    <Layout
      title={`${creator?.name || 'Creator'} - Profile`}
      description={`View ${creator?.name}'s AI tools and stats on Launch AI Jam`}
    >
      <Wrapper>
        <ProfileHeader>
          <Avatar src={creator?.avatar}>
            {!creator?.avatar && (creator?.name?.[0]?.toUpperCase() || '?')}
          </Avatar>
          <ProfileInfo>
            <CreatorName>{creator?.name}</CreatorName>
            {creator?.bio && <CreatorBio>{creator.bio}</CreatorBio>}
            
            <StatsRow>
              <Stat>
                <StatValue>{tools.length}</StatValue>
                <StatLabel>Tools Launched</StatLabel>
              </Stat>
              <Stat>
                <StatValue>{totalVotes.toLocaleString()}</StatValue>
                <StatLabel>Total Votes</StatLabel>
              </Stat>
              <Stat>
                <StatValue>{tools.filter(t => t.featured).length}</StatValue>
                <StatLabel>Featured</StatLabel>
              </Stat>
            </StatsRow>

            {badges.length > 0 && (
              <BadgesSection>
                {badges.map(badgeKey => {
                  const badge = BADGES[badgeKey]
                  return (
                    <Badge key={badgeKey} color={badge.color} textColor={badge.textColor}>
                      {badge.emoji} {badge.name}
                    </Badge>
                  )
                })}
              </BadgesSection>
            )}

            {user?.uid !== username && (
              <div style={{ display: 'flex', alignItems: 'center', marginTop: '1rem' }}>
                <FollowButton 
                  onClick={handleFollow} 
                  isFollowing={isFollowing}
                  disabled={followLoading}
                >
                  {followLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
                </FollowButton>
                {followerCount > 0 && (
                  <FollowerCount>{followerCount} follower{followerCount !== 1 ? 's' : ''}</FollowerCount>
                )}
              </div>
            )}
          </ProfileInfo>
        </ProfileHeader>

        <Section>
          <SectionTitle>🚀 Launched Tools ({tools.length})</SectionTitle>
          {tools.length === 0 ? (
            <EmptyState>No tools launched yet.</EmptyState>
          ) : (
            <ToolList>
              {tools.map(tool => (
                <AIToolCard key={tool.id} tool={tool} />
              ))}
            </ToolList>
          )}
        </Section>
      </Wrapper>
    </Layout>
  )
}
