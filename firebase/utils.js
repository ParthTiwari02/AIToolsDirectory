import firebase from "./firebase"

// Collection name for AI tools
const COLLECTION = "ai_tools"

// Get a single tool by slug
export async function getToolBySlug(slug) {
  const query = await firebase.db
    .collection(COLLECTION)
    .where("slug", "==", slug)
    .get()

  const docs = []

  query.forEach(doc => {
    docs.push({ ...doc.data(), id: doc.id })
  })

  if (docs.length > 0) {
    return docs[0]
  }

  throw new Error("Tool not found")
}

// Get all tools (with optional ordering)
export async function getAllTools(orderBy = "created_at", orderDirection = "desc") {
  const snapshot = await firebase.db
    .collection(COLLECTION)
    .orderBy(orderBy, orderDirection)
    .get()

  const tools = []
  snapshot.forEach(doc => {
    tools.push({ ...doc.data(), id: doc.id })
  })

  return tools
}

// Get tools by category
export async function getToolsByCategory(category, orderBy = "created_at", orderDirection = "desc") {
  const snapshot = await firebase.db
    .collection(COLLECTION)
    .where("category", "==", category)
    .orderBy(orderBy, orderDirection)
    .get()

  const tools = []
  snapshot.forEach(doc => {
    tools.push({ ...doc.data(), id: doc.id })
  })

  return tools
}

// Get featured tools
export async function getFeaturedTools(limit = 5) {
  const snapshot = await firebase.db
    .collection(COLLECTION)
    .where("featured", "==", true)
    .orderBy("created_at", "desc")
    .limit(limit)
    .get()

  const tools = []
  snapshot.forEach(doc => {
    tools.push({ ...doc.data(), id: doc.id })
  })

  return tools
}

// Get trending tools (by upvotes)
export async function getTrendingTools(limit = 10) {
  const snapshot = await firebase.db
    .collection(COLLECTION)
    .orderBy("upvotes", "desc")
    .limit(limit)
    .get()

  const tools = []
  snapshot.forEach(doc => {
    tools.push({ ...doc.data(), id: doc.id })
  })

  return tools
}

// Get new tools
export async function getNewTools(limit = 10) {
  const snapshot = await firebase.db
    .collection(COLLECTION)
    .orderBy("created_at", "desc")
    .limit(limit)
    .get()

  const tools = []
  snapshot.forEach(doc => {
    tools.push({ ...doc.data(), id: doc.id })
  })

  return tools
}

// Get related tools (same category, excluding current tool)
export async function getRelatedTools(category, excludeSlug, limit = 4) {
  const snapshot = await firebase.db
    .collection(COLLECTION)
    .where("category", "==", category)
    .orderBy("upvotes", "desc")
    .limit(limit + 1)
    .get()

  const tools = []
  snapshot.forEach(doc => {
    const data = { ...doc.data(), id: doc.id }
    if (data.slug !== excludeSlug) {
      tools.push(data)
    }
  })

  return tools.slice(0, limit)
}

// Search tools by name or tags
export async function searchTools(query) {
  // Note: Firestore doesn't support full-text search natively
  // For a production app, consider using Algolia or Elasticsearch
  const snapshot = await firebase.db.collection(COLLECTION).get()

  const tools = []
  const lowerQuery = query.toLowerCase()

  snapshot.forEach(doc => {
    const data = { ...doc.data(), id: doc.id }
    const nameMatch = data.name?.toLowerCase().includes(lowerQuery)
    const taglineMatch = data.tagline?.toLowerCase().includes(lowerQuery)
    const tagMatch = data.tags?.some(tag => 
      tag.toLowerCase().includes(lowerQuery)
    )

    if (nameMatch || taglineMatch || tagMatch) {
      tools.push(data)
    }
  })

  return tools
}

// Submit a new AI tool
export async function submitTool(toolData) {
  const newTool = {
    ...toolData,
    upvotes: 0,
    hasVoted: [],
    created_at: Date.now(),
  }

  const docRef = await firebase.db.collection(COLLECTION).add(newTool)
  return { id: docRef.id, ...newTool }
}

// Upvote a tool (limited to once per 24 hours per user)
export async function upvoteTool(toolId, userId) {
  const toolRef = firebase.db.collection(COLLECTION).doc(toolId)
  const tool = await toolRef.get()

  if (!tool.exists) {
    throw new Error("Tool not found")
  }

  const toolData = tool.data()
  const hasVoted = toolData.hasVoted || []
  const now = Date.now()
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000

  // Find user's vote record (can be object with timestamp or legacy string)
  const userVoteIndex = hasVoted.findIndex(vote => {
    if (typeof vote === 'string') return vote === userId
    return vote.userId === userId
  })

  if (userVoteIndex !== -1) {
    const userVote = hasVoted[userVoteIndex]
    
    // Check if it's a legacy string vote or object with timestamp
    if (typeof userVote === 'object' && userVote.timestamp) {
      const timeSinceVote = now - userVote.timestamp
      
      if (timeSinceVote < TWENTY_FOUR_HOURS) {
        // Can't vote again yet
        const hoursRemaining = Math.ceil((TWENTY_FOUR_HOURS - timeSinceVote) / (60 * 60 * 1000))
        throw new Error(`You can upvote again in ${hoursRemaining} hour${hoursRemaining !== 1 ? 's' : ''}`)
      }
    }
    
    // Remove the old vote (toggle off)
    const newHasVoted = hasVoted.filter((_, index) => index !== userVoteIndex)
    await toolRef.update({
      upvotes: Math.max(0, toolData.upvotes - 1),
      hasVoted: newHasVoted,
    })
    return { voted: false, upvotes: Math.max(0, toolData.upvotes - 1) }
  } else {
    // Add new vote with timestamp
    const newVote = { userId, timestamp: now }
    await toolRef.update({
      upvotes: toolData.upvotes + 1,
      hasVoted: [...hasVoted, newVote],
    })
    return { voted: true, upvotes: toolData.upvotes + 1 }
  }
}

// Get all tool slugs for static paths
export async function getAllToolSlugs() {
  const snapshot = await firebase.db.collection(COLLECTION).get()
  const slugs = []
  snapshot.forEach(doc => {
    const data = doc.data()
    if (data.slug) {
      slugs.push(data.slug)
    }
  })
  return slugs
}

// Legacy support - keep for backward compatibility
export async function getPostBySlug(slug) {
  return getToolBySlug(slug)
}
