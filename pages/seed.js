import { useState } from "react"
import styled from "@emotion/styled"
import Layout from "../components/Layout/Layout"
import firebase from "../firebase/index"

const Wrapper = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
`

const Title = styled.h1`
  text-align: center;
  margin-bottom: 2rem;
`

const Button = styled.button`
  display: block;
  width: 100%;
  padding: 1rem 2rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #ff6154 0%, #ff8c42 100%);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 1rem;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(255, 97, 84, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const Status = styled.div`
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
  background: ${props => props.error ? '#fee2e2' : '#dcfce7'};
  color: ${props => props.error ? '#dc2626' : '#166534'};
`

const LogBox = styled.pre`
  background: #1a1a2e;
  color: #00ff00;
  padding: 1rem;
  border-radius: 8px;
  max-height: 400px;
  overflow-y: auto;
  font-size: 0.75rem;
  margin-top: 1rem;
`

const generateTimestamp = (daysAgo) => {
  const now = Date.now()
  const msPerDay = 86400000
  const randomHours = Math.floor(Math.random() * 24) * 3600000
  return now - (daysAgo * msPerDay) + randomHours
}

const sampleTools = [
  {
    name: "Claude Pro",
    tagline: "Advanced AI assistant for complex reasoning and analysis",
    description: "Claude Pro is Anthropic's most capable AI assistant, designed for complex reasoning, analysis, and creative tasks. Features include 200K context window, advanced coding abilities, and safety-first design. Perfect for researchers, developers, and professionals who need reliable AI assistance.",
    website_url: "https://claude.ai",
    logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Anthropic_logo.svg/1200px-Anthropic_logo.svg.png",
    category: "ai",
    tags: ["ai", "assistant", "reasoning", "coding"],
    upvotes: 287,
    daysAgo: 0,
    featured: true,
    creator: { id: "anthropic", name: "Anthropic", avatar: "" }
  },
  {
    name: "Perplexity AI",
    tagline: "AI-powered search engine with real-time answers",
    description: "Perplexity AI is a revolutionary search engine that uses AI to provide direct, sourced answers to your questions. Instead of links, get comprehensive responses with citations. Features Pro Search for deeper research, Collections for organizing topics, and API access for developers.",
    website_url: "https://perplexity.ai",
    logo_url: "https://pbs.twimg.com/profile_images/1798110641414443008/XVoES1Ss_400x400.jpg",
    category: "ai",
    tags: ["search", "ai", "research", "answers"],
    upvotes: 234,
    daysAgo: 0,
    featured: true,
    creator: { id: "perplexity", name: "Perplexity Labs", avatar: "" }
  },
  {
    name: "v0 by Vercel",
    tagline: "Generate UI components with AI using natural language",
    description: "v0 is Vercel's generative UI tool that creates React components from text descriptions. Simply describe what you want and v0 generates production-ready code using shadcn/ui and Tailwind CSS. Export directly to your codebase or iterate with AI assistance.",
    website_url: "https://v0.dev",
    logo_url: "https://v0.dev/icon-192x192.png",
    category: "ai-coding-assistants",
    tags: ["ui", "react", "code-generation", "design"],
    upvotes: 189,
    daysAgo: 0,
    featured: false,
    creator: { id: "vercel", name: "Vercel", avatar: "" }
  },
  {
    name: "Cursor",
    tagline: "The AI-first code editor built for pair programming with AI",
    description: "Cursor is a code editor built from the ground up for AI-assisted programming. Features include intelligent autocomplete, natural language editing, codebase-aware chat, and seamless integration with GPT-4 and Claude. Trusted by developers at leading tech companies.",
    website_url: "https://cursor.sh",
    logo_url: "https://cursor.sh/favicon.ico",
    category: "ai-coding-assistants",
    tags: ["editor", "ai", "coding", "productivity"],
    upvotes: 312,
    daysAgo: 1,
    featured: true,
    creator: { id: "cursor", name: "Anysphere", avatar: "" }
  },
  {
    name: "Runway ML",
    tagline: "AI-powered creative tools for video generation and editing",
    description: "Runway is the leading applied AI research company shaping the next era of art and entertainment. Create stunning videos with Gen-2, remove backgrounds instantly, extend clips, and generate images. Used by Hollywood studios and independent creators alike.",
    website_url: "https://runwayml.com",
    logo_url: "https://runwayml.com/favicon.ico",
    category: "ai-video-creation",
    tags: ["video", "ai", "creative", "generation"],
    upvotes: 278,
    daysAgo: 1,
    featured: true,
    creator: { id: "runway", name: "Runway", avatar: "" }
  },
  {
    name: "Midjourney",
    tagline: "Create stunning AI art with simple text prompts",
    description: "Midjourney is an independent research lab exploring new mediums of thought and expanding the imaginative powers of the human species. Generate breathtaking artwork, illustrations, and designs using natural language prompts. Join millions of creators worldwide.",
    website_url: "https://midjourney.com",
    logo_url: "https://upload.wikimedia.org/wikipedia/commons/e/e6/Midjourney_Emblem.png",
    category: "ai-image-generation",
    tags: ["art", "ai", "images", "creative"],
    upvotes: 567,
    daysAgo: 2,
    featured: true,
    creator: { id: "midjourney", name: "Midjourney Inc", avatar: "" }
  },
  {
    name: "Notion AI",
    tagline: "AI assistant built into your Notion workspace",
    description: "Notion AI helps you write better, think bigger, and work faster. Summarize pages, brainstorm ideas, draft content, fix grammar, and translate text - all within your Notion workspace. Seamlessly integrated with your notes, docs, and projects.",
    website_url: "https://notion.so/product/ai",
    logo_url: "https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png",
    category: "ai-productivity-tools",
    tags: ["productivity", "writing", "ai", "workspace"],
    upvotes: 423,
    daysAgo: 3,
    featured: false,
    creator: { id: "notion", name: "Notion Labs", avatar: "" }
  },
  {
    name: "Jasper AI",
    tagline: "AI copywriting assistant for marketing teams",
    description: "Jasper is the AI content platform that helps your team create content tailored for your brand 10x faster. Generate blog posts, social media content, ad copy, and more. Trusted by 100,000+ teams including IBM, Airbnb, and HubSpot.",
    website_url: "https://jasper.ai",
    logo_url: "https://jasper.ai/favicon.ico",
    category: "ai-writing",
    tags: ["copywriting", "marketing", "ai", "content"],
    upvotes: 345,
    daysAgo: 3,
    featured: false,
    creator: { id: "jasper", name: "Jasper AI", avatar: "" }
  },
  {
    name: "Copy.ai",
    tagline: "AI-powered content creation and automation platform",
    description: "Copy.ai uses AI to help teams generate high-quality copy for blogs, emails, social media, and more. Features include brand voice customization, workflow automation, and team collaboration. Create content that converts in seconds.",
    website_url: "https://copy.ai",
    logo_url: "https://copy.ai/favicon.ico",
    category: "ai-writing",
    tags: ["copywriting", "ai", "automation", "marketing"],
    upvotes: 289,
    daysAgo: 4,
    featured: false,
    creator: { id: "copyai", name: "Copy.ai", avatar: "" }
  },
  {
    name: "Descript",
    tagline: "Edit video and podcasts as easily as editing a doc",
    description: "Descript is an all-in-one video and podcast production tool. Edit media by editing text, remove filler words automatically, generate transcripts, and create clips for social. Features Overdub for AI voice cloning and Studio Sound for audio enhancement.",
    website_url: "https://descript.com",
    logo_url: "https://descript.com/favicon.ico",
    category: "ai-video-creation",
    tags: ["video", "podcast", "ai", "editing"],
    upvotes: 356,
    daysAgo: 4,
    featured: false,
    creator: { id: "descript", name: "Descript", avatar: "" }
  },
  {
    name: "GitHub Copilot",
    tagline: "Your AI pair programmer for faster coding",
    description: "GitHub Copilot uses AI to suggest code and entire functions in real-time, right from your editor. Trained on billions of lines of code, it helps you write code faster with less work. Supports Python, JavaScript, TypeScript, and dozens more languages.",
    website_url: "https://github.com/features/copilot",
    logo_url: "https://github.githubassets.com/favicons/favicon.png",
    category: "ai-coding-assistants",
    tags: ["coding", "ai", "github", "productivity"],
    upvotes: 678,
    daysAgo: 5,
    featured: true,
    creator: { id: "github", name: "GitHub", avatar: "" }
  },
  {
    name: "Synthesia",
    tagline: "Create AI videos with virtual avatars in minutes",
    description: "Synthesia is the #1 AI video generation platform. Create professional videos with AI avatars and voiceovers in 120+ languages. No cameras, actors, or studios needed. Perfect for training, marketing, and corporate communications.",
    website_url: "https://synthesia.io",
    logo_url: "https://synthesia.io/favicon.ico",
    category: "ai-video-creation",
    tags: ["video", "ai", "avatars", "training"],
    upvotes: 234,
    daysAgo: 5,
    featured: false,
    creator: { id: "synthesia", name: "Synthesia", avatar: "" }
  },
  {
    name: "Figma AI",
    tagline: "AI-powered design tools built into Figma",
    description: "Figma AI brings intelligent features directly into your design workflow. Generate UI designs from text prompts, rename layers automatically, remove backgrounds, and get design suggestions. Seamlessly integrated into the Figma you already know.",
    website_url: "https://figma.com/ai",
    logo_url: "https://upload.wikimedia.org/wikipedia/commons/3/33/Figma-logo.svg",
    category: "design-tools",
    tags: ["design", "ai", "figma", "ui"],
    upvotes: 456,
    daysAgo: 8,
    featured: true,
    creator: { id: "figma", name: "Figma", avatar: "" }
  },
  {
    name: "Gamma",
    tagline: "Create beautiful presentations with AI in seconds",
    description: "Gamma is a new medium for presenting ideas. Generate polished presentations, documents, and webpages in seconds. AI helps with content, design, and formatting. No more blank slides or formatting headaches.",
    website_url: "https://gamma.app",
    logo_url: "https://gamma.app/favicon.ico",
    category: "ai-productivity-tools",
    tags: ["presentations", "ai", "design", "productivity"],
    upvotes: 389,
    daysAgo: 10,
    featured: false,
    creator: { id: "gamma", name: "Gamma Tech", avatar: "" }
  },
  {
    name: "ElevenLabs",
    tagline: "AI voice generation and cloning platform",
    description: "ElevenLabs offers the most realistic and versatile AI speech software. Generate natural-sounding voiceovers, clone voices, and create multilingual content. Used for audiobooks, videos, podcasts, and accessibility applications.",
    website_url: "https://elevenlabs.io",
    logo_url: "https://elevenlabs.io/favicon.ico",
    category: "ai",
    tags: ["voice", "ai", "audio", "text-to-speech"],
    upvotes: 512,
    daysAgo: 12,
    featured: true,
    creator: { id: "elevenlabs", name: "ElevenLabs", avatar: "" }
  },
  {
    name: "Luma AI",
    tagline: "Create 3D models and videos from text and images",
    description: "Luma AI lets anyone create photorealistic 3D content. Capture 3D scenes with your phone, generate 3D models from text, and create stunning videos. Perfect for e-commerce, gaming, and creative projects.",
    website_url: "https://lumalabs.ai",
    logo_url: "https://lumalabs.ai/favicon.ico",
    category: "ai-image-generation",
    tags: ["3d", "ai", "video", "creative"],
    upvotes: 298,
    daysAgo: 14,
    featured: false,
    creator: { id: "luma", name: "Luma AI", avatar: "" }
  },
  {
    name: "Otter.ai",
    tagline: "AI meeting assistant that records and transcribes",
    description: "Otter.ai uses AI to generate meeting notes with action items, summaries, and searchable transcripts. Integrates with Zoom, Google Meet, and Microsoft Teams. Never miss important details from your meetings again.",
    website_url: "https://otter.ai",
    logo_url: "https://otter.ai/favicon.ico",
    category: "ai-productivity-tools",
    tags: ["meetings", "transcription", "ai", "productivity"],
    upvotes: 267,
    daysAgo: 16,
    featured: false,
    creator: { id: "otter", name: "Otter.ai", avatar: "" }
  },
  {
    name: "Grammarly",
    tagline: "AI writing assistant for clear and mistake-free writing",
    description: "Grammarly's AI-powered writing assistant helps millions of people communicate more effectively. Check grammar, spelling, and punctuation. Get style and tone suggestions. Write with confidence across browsers, apps, and devices.",
    website_url: "https://grammarly.com",
    logo_url: "https://grammarly.com/favicon.ico",
    category: "ai-writing",
    tags: ["writing", "grammar", "ai", "productivity"],
    upvotes: 534,
    daysAgo: 18,
    featured: false,
    creator: { id: "grammarly", name: "Grammarly Inc", avatar: "" }
  },
  {
    name: "Canva AI",
    tagline: "AI-powered design tools for everyone",
    description: "Canva's Magic Studio brings AI to design. Generate images with Magic Media, expand images with Magic Expand, remove backgrounds, write copy, and translate designs. Create professional graphics without design experience.",
    website_url: "https://canva.com/ai-image-generator",
    logo_url: "https://upload.wikimedia.org/wikipedia/commons/0/08/Canva_icon_2021.svg",
    category: "design-tools",
    tags: ["design", "ai", "graphics", "creative"],
    upvotes: 623,
    daysAgo: 20,
    featured: true,
    creator: { id: "canva", name: "Canva", avatar: "" }
  },
  {
    name: "Zapier AI",
    tagline: "Automate workflows with AI-powered automation",
    description: "Zapier's AI features help you automate faster. Use natural language to create Zaps, get AI suggestions for automations, and use AI actions in your workflows. Connect 5,000+ apps with intelligent automation.",
    website_url: "https://zapier.com/ai",
    logo_url: "https://zapier.com/favicon.ico",
    category: "ai-productivity-tools",
    tags: ["automation", "ai", "workflow", "integration"],
    upvotes: 345,
    daysAgo: 22,
    featured: false,
    creator: { id: "zapier", name: "Zapier", avatar: "" }
  }
]

const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export default function SeedPage() {
  const [status, setStatus] = useState("")
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState([])

  const seedDatabase = async () => {
    setLoading(true)
    setError(false)
    setLogs(["[" + new Date().toLocaleTimeString() + "] Starting database seed..."])

    try {
      // Get all existing slugs in one query
      const existingSnapshot = await firebase.db.collection("ai_tools").get()
      const existingSlugs = new Set()
      existingSnapshot.forEach(doc => {
        const data = doc.data()
        if (data.slug) existingSlugs.add(data.slug)
      })
      
      setLogs(prev => [...prev, "[" + new Date().toLocaleTimeString() + "] Found " + existingSlugs.size + " existing tools"])

      // Filter tools that don't exist yet
      const toolsToAdd = sampleTools.filter(tool => {
        const slug = generateSlug(tool.name)
        return !existingSlugs.has(slug)
      })

      if (toolsToAdd.length === 0) {
        setLogs(prev => [...prev, "[" + new Date().toLocaleTimeString() + "] All tools already exist!"])
        setStatus("All " + sampleTools.length + " tools already in database!")
        setLoading(false)
        return
      }

      setLogs(prev => [...prev, "[" + new Date().toLocaleTimeString() + "] Adding " + toolsToAdd.length + " new tools..."])

      // Use batch write for speed (max 500 per batch)
      const batch = firebase.db.batch()
      
      toolsToAdd.forEach(tool => {
        const slug = generateSlug(tool.name)
        const docRef = firebase.db.collection("ai_tools").doc()
        
        batch.set(docRef, {
          name: tool.name,
          tagline: tool.tagline,
          description: tool.description,
          website_url: tool.website_url,
          logo_url: tool.logo_url,
          category: tool.category,
          tags: tool.tags,
          slug: slug,
          upvotes: tool.upvotes,
          hasVoted: [],
          featured: tool.featured,
          created_at: generateTimestamp(tool.daysAgo),
          comments: [],
          comment_count: 0,
          creator: tool.creator
        })
      })

      await batch.commit()
      
      const finalLogs = [
        "[" + new Date().toLocaleTimeString() + "] Starting database seed...",
        "[" + new Date().toLocaleTimeString() + "] Found " + existingSlugs.size + " existing tools",
        "[" + new Date().toLocaleTimeString() + "] Added " + toolsToAdd.length + " tools: " + toolsToAdd.map(t => t.name).join(", "),
        "[" + new Date().toLocaleTimeString() + "] Seed complete!"
      ]
      setLogs(finalLogs)
      setStatus("Successfully seeded " + toolsToAdd.length + " AI tools!")
    } catch (err) {
      console.error("Seed error:", err)
      setLogs(prev => [...prev, "[" + new Date().toLocaleTimeString() + "] Error: " + err.message])
      setError(true)
      setStatus("Error: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const clearDatabase = async () => {
    if (!confirm("Are you sure you want to delete ALL tools? This cannot be undone!")) {
      return
    }

    setLoading(true)
    setError(false)
    setLogs(["[" + new Date().toLocaleTimeString() + "] Clearing database..."])

    try {
      const snapshot = await firebase.db.collection("ai_tools").get()
      setLogs(prev => [...prev, "[" + new Date().toLocaleTimeString() + "] Found " + snapshot.size + " tools to delete"])

      const batch = firebase.db.batch()
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref)
      })

      await batch.commit()
      setLogs(prev => [...prev, "[" + new Date().toLocaleTimeString() + "] Deleted " + snapshot.size + " tools"])
      setStatus("Cleared " + snapshot.size + " tools from database")
    } catch (err) {
      console.error("Clear error:", err)
      setLogs(prev => [...prev, "[" + new Date().toLocaleTimeString() + "] Error: " + err.message])
      setError(true)
      setStatus("Error: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout title="Seed Database">
      <Wrapper>
        <Title>Database Seeder</Title>
        
        <p style={{ textAlign: 'center', color: '#667190', marginBottom: '2rem' }}>
          Seed the database with {sampleTools.length} sample AI tools to make the site look active.
        </p>

        <Button onClick={seedDatabase} disabled={loading}>
          {loading ? "Seeding..." : "Seed " + sampleTools.length + " AI Tools"}
        </Button>

        <Button 
          onClick={clearDatabase} 
          disabled={loading}
          style={{ background: '#dc2626' }}
        >
          {loading ? "Clearing..." : "Clear All Tools"}
        </Button>

        {status && <Status error={error}>{status}</Status>}
        
        {logs.length > 0 && (
          <LogBox>
            {logs.map((log, i) => (
              <div key={i}>{log}</div>
            ))}
          </LogBox>
        )}
      </Wrapper>
    </Layout>
  )
}
