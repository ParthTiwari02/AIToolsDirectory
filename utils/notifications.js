import firebase from "../firebase/index"

/**
 * Create a notification for a user
 * @param {Object} params - Notification parameters
 * @param {string} params.userId - ID of the user to notify
 * @param {string} params.type - Type of notification: 'upvote' | 'comment' | 'follow' | 'launch' | 'featured' | 'milestone'
 * @param {string} params.message - HTML message to display
 * @param {string} [params.toolSlug] - Slug of the related tool (if applicable)
 * @param {string} [params.creatorId] - ID of the related creator (if applicable)
 */
export async function createNotification({ userId, type, message, toolSlug, creatorId }) {
  try {
    await firebase.db.collection("notifications").add({
      userId,
      type,
      message,
      toolSlug: toolSlug || null,
      creatorId: creatorId || null,
      read: false,
      created_at: Date.now(),
    })
  } catch (error) {
    console.error("Error creating notification:", error)
  }
}

/**
 * Notify tool creator about an upvote
 */
export async function notifyUpvote(tool, voterName) {
  if (!tool.creator?.id) return
  
  await createNotification({
    userId: tool.creator.id,
    type: 'upvote',
    message: `<strong>${voterName}</strong> upvoted your tool <strong>${tool.name}</strong>`,
    toolSlug: tool.slug,
  })
}

/**
 * Notify tool creator about a comment
 */
export async function notifyComment(tool, commenterName) {
  if (!tool.creator?.id) return
  
  await createNotification({
    userId: tool.creator.id,
    type: 'comment',
    message: `<strong>${commenterName}</strong> commented on your tool <strong>${tool.name}</strong>`,
    toolSlug: tool.slug,
  })
}

/**
 * Notify user about a new follower
 */
export async function notifyFollow(creatorId, creatorName, followerName) {
  await createNotification({
    userId: creatorId,
    type: 'follow',
    message: `<strong>${followerName}</strong> started following you`,
    creatorId,
  })
}

/**
 * Notify followers about a new tool launch
 */
export async function notifyFollowersOfLaunch(creatorId, tool) {
  try {
    // Get all followers of this creator
    const snapshot = await firebase.db
      .collection("follows")
      .where("creatorId", "==", creatorId)
      .get()

    const notifications = []
    snapshot.forEach(doc => {
      const followData = doc.data()
      notifications.push(
        createNotification({
          userId: followData.followerId,
          type: 'launch',
          message: `<strong>${tool.creator?.name || 'A creator you follow'}</strong> launched <strong>${tool.name}</strong>`,
          toolSlug: tool.slug,
          creatorId: creatorId,
        })
      )
    })

    await Promise.all(notifications)
  } catch (error) {
    console.error("Error notifying followers:", error)
  }
}

/**
 * Notify about upvote milestone
 */
export async function notifyMilestone(tool, milestone) {
  if (!tool.creator?.id) return
  
  await createNotification({
    userId: tool.creator.id,
    type: 'milestone',
    message: `🎉 Your tool <strong>${tool.name}</strong> reached <strong>${milestone} upvotes</strong>!`,
    toolSlug: tool.slug,
  })
}

/**
 * Notify that a tool was featured
 */
export async function notifyFeatured(tool) {
  if (!tool.creator?.id) return
  
  await createNotification({
    userId: tool.creator.id,
    type: 'featured',
    message: `⭐ Your tool <strong>${tool.name}</strong> has been featured!`,
    toolSlug: tool.slug,
  })
}
