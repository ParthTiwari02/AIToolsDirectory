import { useState } from "react"
import firebase from "../firebase/index"

const sampleTools = [
  {
    name: "ChatGPT",
    tagline: "AI-powered conversational assistant",
    description: "ChatGPT is an advanced AI language model by OpenAI.",
    website_url: "https://chat.openai.com",
    logo_url: "",
    category: "ai-writing",
    tags: ["chatbot", "gpt", "openai"],
    upvotes: 1250,
    featured: true,
    slug: "chatgpt",
  },
  {
    name: "Midjourney",
    tagline: "AI art generator creating stunning visuals",
    description: "Midjourney generates images from text descriptions.",
    website_url: "https://www.midjourney.com",
    logo_url: "",
    category: "ai-image-generation",
    tags: ["art", "image", "design"],
    upvotes: 1100,
    featured: true,
    slug: "midjourney",
  },
  {
    name: "GitHub Copilot",
    tagline: "Your AI pair programmer",
    description: "GitHub Copilot helps you write code faster.",
    website_url: "https://github.com/features/copilot",
    logo_url: "",
    category: "ai-coding-assistants",
    tags: ["coding", "github"],
    upvotes: 1340,
    featured: true,
    slug: "github-copilot",
  },
  {
    name: "Notion AI",
    tagline: "AI writing and productivity in Notion",
    description: "Notion AI helps you write, summarize, and brainstorm.",
    website_url: "https://www.notion.so/product/ai",
    logo_url: "",
    category: "ai-productivity-tools",
    tags: ["notion", "writing", "notes"],
    upvotes: 967,
    featured: true,
    slug: "notion-ai",
  },
  {
    name: "Runway",
    tagline: "AI-powered video generation tools",
    description: "Runway generates videos from text and images.",
    website_url: "https://runwayml.com",
    logo_url: "",
    category: "ai-video-creation",
    tags: ["video", "editing"],
    upvotes: 834,
    featured: true,
    slug: "runway",
  },
  {
    name: "HubSpot AI",
    tagline: "AI-powered CRM and marketing",
    description: "Generate content with AI across HubSpot.",
    website_url: "https://www.hubspot.com/artificial-intelligence",
    logo_url: "",
    category: "ai-marketing-tools",
    tags: ["crm", "marketing"],
    upvotes: 756,
    featured: true,
    slug: "hubspot-ai",
  },
]

export default function SeedPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const seedDatabase = async () => {
    setLoading(true)
    setMessage("Seeding...")

    try {
      for (const tool of sampleTools) {
        await firebase.db.collection("ai_tools").add({
          ...tool,
          created_at: Date.now() - Math.floor(Math.random() * 30) * 86400000,
          hasVoted: [],
          submitter_email: "demo@example.com",
        })
      }
      setMessage(`✅ Added ${sampleTools.length} AI tools!`)
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const clearDatabase = async () => {
    if (!confirm("Delete all AI tools?")) return
    
    setLoading(true)
    setMessage("Clearing...")

    try {
      const snapshot = await firebase.db.collection("ai_tools").get()
      const batch = firebase.db.batch()
      snapshot.docs.forEach(doc => batch.delete(doc.ref))
      await batch.commit()
      setMessage(`✅ Deleted ${snapshot.size} tools`)
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: "50px auto", padding: 20, fontFamily: "system-ui" }}>
      <h1>🌱 Database Seed Tool</h1>
      <p style={{ color: "#666" }}>Add sample AI tools to your Firestore database</p>
      
      <div style={{ marginTop: 30 }}>
        <button
          onClick={seedDatabase}
          disabled={loading}
          style={{
            padding: "12px 24px",
            background: "#ff6154",
            color: "white",
            border: "none",
            borderRadius: 8,
            fontSize: 16,
            cursor: loading ? "not-allowed" : "pointer",
            marginRight: 10,
          }}
        >
          {loading ? "Working..." : "🌱 Seed Database"}
        </button>
        
        <button
          onClick={clearDatabase}
          disabled={loading}
          style={{
            padding: "12px 24px",
            background: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: 8,
            fontSize: 16,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          🗑️ Clear All
        </button>
      </div>

      {message && (
        <div style={{
          marginTop: 20,
          padding: 15,
          background: message.includes("✅") ? "#f0fdf4" : "#fef2f2",
          borderRadius: 8,
          color: message.includes("✅") ? "#166534" : "#991b1b",
        }}>
          {message}
        </div>
      )}

      <div style={{ marginTop: 30, padding: 15, background: "#f9fafb", borderRadius: 8 }}>
        <strong>Sample tools to be added:</strong>
        <ul style={{ margin: "10px 0 0 0", paddingLeft: 20 }}>
          {sampleTools.map(t => <li key={t.slug}>{t.name} ({t.category})</li>)}
        </ul>
      </div>
    </div>
  )
}
