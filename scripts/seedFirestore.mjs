/**
 * Firestore Seed Script
 * 
 * This script populates your Firestore database with sample AI tools.
 * 
 * USAGE:
 * 1. Make sure you have Node.js installed
 * 2. Run: node scripts/seedFirestore.mjs
 * 
 * NOTE: This uses ES modules and Firebase Admin SDK
 */

import admin from 'firebase-admin'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Sample AI Tools Data (inline to avoid import issues)
const sampleAITools = [
  // AI Writing Tools
  {
    name: "ChatGPT",
    tagline: "AI-powered conversational assistant for any task",
    description: "ChatGPT is an advanced AI language model developed by OpenAI that can engage in human-like conversations, answer questions, write content, debug code, and assist with a wide variety of tasks. It's trained on diverse internet text and can understand context, follow instructions, and generate coherent responses across multiple domains.",
    website_url: "https://chat.openai.com",
    logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/1024px-ChatGPT_logo.svg.png",
    category: "ai-writing",
    tags: ["chatbot", "gpt", "openai", "conversation", "writing"],
    upvotes: 1250,
    featured: true,
    created_at: Date.now() - 86400000 * 30,
    submitter_email: "demo@example.com",
    hasVoted: [],
    slug: "chatgpt",
  },
  {
    name: "Jasper AI",
    tagline: "AI content platform for marketing teams",
    description: "Jasper is an AI writing assistant that helps marketing teams create high-quality content 10x faster. From blog posts to social media captions, email campaigns to ad copy, Jasper understands your brand voice and produces on-brand content at scale.",
    website_url: "https://www.jasper.ai",
    logo_url: "https://www.jasper.ai/favicon.ico",
    category: "ai-writing",
    tags: ["copywriting", "marketing", "content", "blog"],
    upvotes: 890,
    featured: false,
    created_at: Date.now() - 86400000 * 25,
    submitter_email: "demo@example.com",
    hasVoted: [],
    slug: "jasper-ai",
  },
  {
    name: "Copy.ai",
    tagline: "AI-powered copywriting for better marketing",
    description: "Copy.ai uses AI to help you write better marketing copy in seconds. Generate product descriptions, social media posts, blog intros, email subject lines, and more.",
    website_url: "https://www.copy.ai",
    logo_url: "https://assets-global.website-files.com/628288c5cd3e8411b90a36a4/6500da2c4ae38dbf8fc3d27c_favicon-32x32.webp",
    category: "ai-writing",
    tags: ["copywriting", "marketing", "automation"],
    upvotes: 567,
    featured: false,
    created_at: Date.now() - 86400000 * 20,
    submitter_email: "demo@example.com",
    hasVoted: [],
    slug: "copy-ai",
  },

  // AI Image Generation
  {
    name: "Midjourney",
    tagline: "AI art generator creating stunning visuals from text",
    description: "Midjourney is an independent research lab's AI program that generates images from natural language descriptions. Known for its artistic, painterly style, Midjourney creates stunning visuals that range from photorealistic to fantastical.",
    website_url: "https://www.midjourney.com",
    logo_url: "https://cdn.midjourney.com/favicon.ico",
    category: "ai-image-generation",
    tags: ["art", "image", "design", "creative", "discord"],
    upvotes: 1100,
    featured: true,
    created_at: Date.now() - 86400000 * 28,
    submitter_email: "demo@example.com",
    hasVoted: [],
    slug: "midjourney",
  },
  {
    name: "DALL-E 3",
    tagline: "Create realistic images from text descriptions",
    description: "DALL-E 3 by OpenAI is a cutting-edge AI system that can create realistic images and art from natural language descriptions. It understands nuance, context, and can render text within images accurately.",
    website_url: "https://openai.com/dall-e-3",
    logo_url: "https://openai.com/favicon.ico",
    category: "ai-image-generation",
    tags: ["openai", "image", "art", "creative"],
    upvotes: 980,
    featured: true,
    created_at: Date.now() - 86400000 * 15,
    submitter_email: "demo@example.com",
    hasVoted: [],
    slug: "dall-e-3",
  },
  {
    name: "Stable Diffusion",
    tagline: "Open-source AI image generation model",
    description: "Stable Diffusion is a deep learning, text-to-image model released in 2022. It's open-source and can run on consumer hardware, making AI image generation accessible to everyone.",
    website_url: "https://stability.ai",
    logo_url: "https://stability.ai/favicon.ico",
    category: "ai-image-generation",
    tags: ["open-source", "image", "art", "local"],
    upvotes: 756,
    featured: false,
    created_at: Date.now() - 86400000 * 22,
    submitter_email: "demo@example.com",
    hasVoted: [],
    slug: "stable-diffusion",
  },

  // AI Video Creation
  {
    name: "Runway",
    tagline: "AI-powered creative tools for video generation",
    description: "Runway is an applied AI research company building the next generation of creative tools. Their Gen-2 model can generate novel videos from text, images, or video clips.",
    website_url: "https://runwayml.com",
    logo_url: "https://runwayml.com/favicon.ico",
    category: "ai-video-creation",
    tags: ["video", "editing", "generation", "creative"],
    upvotes: 834,
    featured: true,
    created_at: Date.now() - 86400000 * 18,
    submitter_email: "demo@example.com",
    hasVoted: [],
    slug: "runway",
  },
  {
    name: "Synthesia",
    tagline: "Create AI videos with virtual presenters",
    description: "Synthesia is an AI video generation platform that lets you create professional videos with AI avatars in 120+ languages. No cameras, microphones, or actors needed.",
    website_url: "https://www.synthesia.io",
    logo_url: "https://www.synthesia.io/favicon.ico",
    category: "ai-video-creation",
    tags: ["video", "avatar", "presentation", "training"],
    upvotes: 623,
    featured: false,
    created_at: Date.now() - 86400000 * 12,
    submitter_email: "demo@example.com",
    hasVoted: [],
    slug: "synthesia",
  },

  // AI Coding Assistants
  {
    name: "GitHub Copilot",
    tagline: "Your AI pair programmer for faster coding",
    description: "GitHub Copilot is an AI pair programmer that helps you write code faster with less work. It draws context from comments and code to suggest individual lines and whole functions.",
    website_url: "https://github.com/features/copilot",
    logo_url: "https://github.githubassets.com/favicons/favicon.svg",
    category: "ai-coding-assistants",
    tags: ["coding", "github", "autocomplete", "ide"],
    upvotes: 1340,
    featured: true,
    created_at: Date.now() - 86400000 * 35,
    submitter_email: "demo@example.com",
    hasVoted: [],
    slug: "github-copilot",
  },
  {
    name: "Cursor",
    tagline: "The AI-first code editor built for productivity",
    description: "Cursor is an AI-first code editor designed to make developers more productive. Chat with your codebase, generate code from natural language, refactor with AI assistance, and debug faster.",
    website_url: "https://cursor.sh",
    logo_url: "https://cursor.sh/favicon.ico",
    category: "ai-coding-assistants",
    tags: ["editor", "ide", "coding", "vscode"],
    upvotes: 892,
    featured: true,
    created_at: Date.now() - 86400000 * 10,
    submitter_email: "demo@example.com",
    hasVoted: [],
    slug: "cursor",
  },
  {
    name: "Tabnine",
    tagline: "AI code completion for all programming languages",
    description: "Tabnine is an AI assistant that speeds up delivery and keeps your code safe. It provides AI-powered code completions based on context and your codebase.",
    website_url: "https://www.tabnine.com",
    logo_url: "https://www.tabnine.com/favicon.ico",
    category: "ai-coding-assistants",
    tags: ["autocomplete", "ide", "privacy", "local"],
    upvotes: 534,
    featured: false,
    created_at: Date.now() - 86400000 * 40,
    submitter_email: "demo@example.com",
    hasVoted: [],
    slug: "tabnine",
  },

  // AI Productivity Tools
  {
    name: "Notion AI",
    tagline: "AI-powered writing and productivity in Notion",
    description: "Notion AI is integrated directly into your Notion workspace. Summarize meeting notes, generate action items, write drafts, fix grammar, translate languages, and brainstorm ideas.",
    website_url: "https://www.notion.so/product/ai",
    logo_url: "https://www.notion.so/images/favicon.ico",
    category: "ai-productivity-tools",
    tags: ["notion", "writing", "notes", "workspace"],
    upvotes: 967,
    featured: true,
    created_at: Date.now() - 86400000 * 14,
    submitter_email: "demo@example.com",
    hasVoted: [],
    slug: "notion-ai",
  },
  {
    name: "Otter.ai",
    tagline: "AI meeting assistant for transcription and notes",
    description: "Otter.ai provides real-time transcription and automated meeting notes. Join your Zoom, Google Meet, or Microsoft Teams calls automatically.",
    website_url: "https://otter.ai",
    logo_url: "https://otter.ai/favicon.ico",
    category: "ai-productivity-tools",
    tags: ["transcription", "meetings", "notes", "voice"],
    upvotes: 678,
    featured: false,
    created_at: Date.now() - 86400000 * 16,
    submitter_email: "demo@example.com",
    hasVoted: [],
    slug: "otter-ai",
  },
  {
    name: "Reclaim.ai",
    tagline: "AI calendar assistant for smart scheduling",
    description: "Reclaim.ai is an intelligent calendar assistant that automatically finds the best time for your tasks, habits, and meetings.",
    website_url: "https://reclaim.ai",
    logo_url: "https://reclaim.ai/favicon.ico",
    category: "ai-productivity-tools",
    tags: ["calendar", "scheduling", "time-management"],
    upvotes: 445,
    featured: false,
    created_at: Date.now() - 86400000 * 5,
    submitter_email: "demo@example.com",
    hasVoted: [],
    slug: "reclaim-ai",
  },

  // AI Marketing Tools
  {
    name: "HubSpot AI",
    tagline: "AI-powered CRM and marketing automation",
    description: "HubSpot's AI features help you work smarter across marketing, sales, and service. Generate blog posts, emails, and social content.",
    website_url: "https://www.hubspot.com/artificial-intelligence",
    logo_url: "https://www.hubspot.com/favicon.ico",
    category: "ai-marketing-tools",
    tags: ["crm", "marketing", "automation", "sales"],
    upvotes: 756,
    featured: true,
    created_at: Date.now() - 86400000 * 20,
    submitter_email: "demo@example.com",
    hasVoted: [],
    slug: "hubspot-ai",
  },
  {
    name: "Surfer SEO",
    tagline: "AI-powered content optimization for better rankings",
    description: "Surfer SEO analyzes top-ranking pages and provides data-driven recommendations to optimize your content.",
    website_url: "https://surferseo.com",
    logo_url: "https://surferseo.com/favicon.ico",
    category: "ai-marketing-tools",
    tags: ["seo", "content", "optimization", "ranking"],
    upvotes: 589,
    featured: false,
    created_at: Date.now() - 86400000 * 11,
    submitter_email: "demo@example.com",
    hasVoted: [],
    slug: "surfer-seo",
  },
  {
    name: "AdCreative.ai",
    tagline: "Generate high-converting ad creatives with AI",
    description: "AdCreative.ai uses AI to generate conversion-focused ad creatives in seconds. Create hundreds of ad variations for Facebook, Instagram, Google, and more.",
    website_url: "https://www.adcreative.ai",
    logo_url: "https://www.adcreative.ai/favicon.ico",
    category: "ai-marketing-tools",
    tags: ["ads", "creative", "design", "conversion"],
    upvotes: 423,
    featured: false,
    created_at: Date.now() - 86400000 * 3,
    submitter_email: "demo@example.com",
    hasVoted: [],
    slug: "adcreative-ai",
  },
]

// Firebase configuration
const firebaseConfig = {
  projectId: "ph-project-f5a3b",
}

// Initialize Firebase Admin
// You need to either:
// 1. Set GOOGLE_APPLICATION_CREDENTIALS environment variable
// 2. Or download a service account key from Firebase Console

async function seedDatabase() {
  try {
    // Try to initialize with default credentials (works in Google Cloud environment)
    // For local development, you need a service account key
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        ...firebaseConfig
      })
    }

    const db = admin.firestore()
    const batch = db.batch()

    console.log('🚀 Starting to seed database...\n')

    // Delete existing ai_tools collection (optional - comment out if you want to keep existing data)
    console.log('🗑️  Clearing existing ai_tools collection...')
    const existingDocs = await db.collection('ai_tools').get()
    existingDocs.forEach(doc => {
      batch.delete(doc.ref)
    })
    
    // Add sample tools
    console.log('📝 Adding sample AI tools...\n')
    
    for (const tool of sampleAITools) {
      const docRef = db.collection('ai_tools').doc()
      batch.set(docRef, tool)
      console.log(`   ✅ ${tool.name} (${tool.category})`)
    }

    await batch.commit()

    console.log('\n✨ Database seeded successfully!')
    console.log(`   Added ${sampleAITools.length} AI tools`)
    console.log(`   Featured tools: ${sampleAITools.filter(t => t.featured).length}`)
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding database:', error.message)
    console.log('\n📋 To use this script locally, you need to:')
    console.log('   1. Go to Firebase Console → Project Settings → Service Accounts')
    console.log('   2. Click "Generate new private key"')
    console.log('   3. Save the JSON file as "serviceAccountKey.json" in the project root')
    console.log('   4. Run: GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json node scripts/seedFirestore.mjs')
    process.exit(1)
  }
}

seedDatabase()
