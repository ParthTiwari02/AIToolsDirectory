import { useEffect, useState, useContext } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import styled from "@emotion/styled"
import { formatDistanceToNow } from "date-fns"
import Layout from "@components/Layout/Layout"
import FirebaseContext from "../firebase/context"
import firebase from "../firebase/index"

const Wrapper = styled.div`
  max-width: 700px;
  margin: 0 auto;
  padding: 2rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: #21293c;
  margin: 0;
`

const MarkAllButton = styled.button`
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #ff6154;
  background: transparent;
  border: 1px solid #ff6154;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #ff6154;
    color: white;
  }
`

const NotificationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const NotificationCard = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: ${props => props.unread ? '#fffbeb' : 'white'};
  border: 1px solid ${props => props.unread ? '#fde68a' : '#e5e7eb'};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #ff6154;
    transform: translateX(4px);
  }

  ${props => props.unread && `
    border-left: 3px solid #ff6154;
  `}
`

const IconWrapper = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.bg || '#f3f4f6'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
`

const Content = styled.div`
  flex: 1;
  min-width: 0;
`

const Message = styled.p`
  margin: 0 0 0.25rem 0;
  color: #21293c;
  font-size: 0.9375rem;
  line-height: 1.5;

  strong {
    font-weight: 600;
  }
`

const Timestamp = styled.span`
  font-size: 0.8125rem;
  color: #667190;
`

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background: #f9fafb;
  border-radius: 16px;

  h2 {
    font-size: 1.25rem;
    color: #21293c;
    margin: 1rem 0 0.5rem 0;
  }

  p {
    color: #667190;
    margin: 0;
  }
`

const LoginPrompt = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 16px;

  h2 {
    font-size: 1.5rem;
    color: #21293c;
    margin: 0 0 1rem 0;
  }

  p {
    color: #667190;
    margin: 0 0 1.5rem 0;
  }
`

const SignInButton = styled.a`
  display: inline-block;
  padding: 0.75rem 2rem;
  background: linear-gradient(135deg, #ff6154 0%, #ff8c42 100%);
  color: white;
  font-weight: 600;
  text-decoration: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(255, 97, 84, 0.3);
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

const NOTIFICATION_ICONS = {
  upvote: { emoji: '🔺', bg: '#dcfce7' },
  comment: { emoji: '💬', bg: '#dbeafe' },
  follow: { emoji: '🤝', bg: '#fce7f3' },
  launch: { emoji: '🚀', bg: '#fef3c7' },
  featured: { emoji: '⭐', bg: '#e0e7ff' },
  milestone: { emoji: '🎉', bg: '#f3e8ff' },
}

export default function Notifications() {
  const router = useRouter()
  const { user } = useContext(FirebaseContext)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const fetchNotifications = async () => {
      try {
        const snapshot = await firebase.db
          .collection("notifications")
          .where("userId", "==", user.uid)
          .orderBy("created_at", "desc")
          .limit(50)
          .get()

        const notifs = []
        snapshot.forEach(doc => {
          notifs.push({ id: doc.id, ...doc.data() })
        })
        setNotifications(notifs)
      } catch (error) {
        console.error("Error fetching notifications:", error)
        // If index doesn't exist, show empty state
        setNotifications([])
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [user])

  const handleNotificationClick = async (notification) => {
    // Mark as read
    if (!notification.read) {
      try {
        await firebase.db.collection("notifications").doc(notification.id).update({ read: true })
        setNotifications(prev => 
          prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
        )
      } catch (error) {
        console.error("Error marking notification as read:", error)
      }
    }

    // Navigate to relevant page
    if (notification.toolSlug) {
      router.push(`/tool/${notification.toolSlug}`)
    } else if (notification.creatorId) {
      router.push(`/creator/${notification.creatorId}`)
    }
  }

  const handleMarkAllRead = async () => {
    const unreadNotifs = notifications.filter(n => !n.read)
    if (unreadNotifs.length === 0) return

    try {
      const batch = firebase.db.batch()
      unreadNotifs.forEach(n => {
        const ref = firebase.db.collection("notifications").doc(n.id)
        batch.update(ref, { read: true })
      })
      await batch.commit()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch (error) {
      console.error("Error marking all as read:", error)
    }
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return ''
    const date = typeof timestamp === 'number' ? new Date(timestamp) : timestamp.toDate?.() || new Date(timestamp)
    return formatDistanceToNow(date, { addSuffix: true })
  }

  if (loading) {
    return (
      <Layout title="Notifications - Launch AI Jam">
        <Wrapper>
          <LoadingState>
            <div className="spinner" />
          </LoadingState>
        </Wrapper>
      </Layout>
    )
  }

  if (!user) {
    return (
      <Layout title="Notifications - Launch AI Jam">
        <Wrapper>
          <LoginPrompt>
            <h2>🔔 Stay Updated</h2>
            <p>Sign in to see your notifications</p>
            <Link href="/signin" legacyBehavior>
              <SignInButton>Sign In</SignInButton>
            </Link>
          </LoginPrompt>
        </Wrapper>
      </Layout>
    )
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <Layout title="Notifications - Launch AI Jam">
      <Wrapper>
        <Header>
          <Title>
            🔔 Notifications
            {unreadCount > 0 && <span style={{ fontSize: '0.875rem', color: '#ff6154', marginLeft: '0.5rem' }}>({unreadCount} new)</span>}
          </Title>
          {unreadCount > 0 && (
            <MarkAllButton onClick={handleMarkAllRead}>
              Mark all as read
            </MarkAllButton>
          )}
        </Header>

        {notifications.length === 0 ? (
          <EmptyState>
            <div style={{ fontSize: '3rem' }}>📭</div>
            <h2>No notifications yet</h2>
            <p>When someone upvotes or comments on your tools, you'll see it here.</p>
          </EmptyState>
        ) : (
          <NotificationList>
            {notifications.map(notification => {
              const icon = NOTIFICATION_ICONS[notification.type] || NOTIFICATION_ICONS.upvote
              return (
                <NotificationCard 
                  key={notification.id}
                  unread={!notification.read}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <IconWrapper bg={icon.bg}>
                    {icon.emoji}
                  </IconWrapper>
                  <Content>
                    <Message dangerouslySetInnerHTML={{ __html: notification.message }} />
                    <Timestamp>{formatTime(notification.created_at)}</Timestamp>
                  </Content>
                </NotificationCard>
              )
            })}
          </NotificationList>
        )}
      </Wrapper>
    </Layout>
  )
}
