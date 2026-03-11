// AI Tool Categories Configuration - Expanded list like auraplusplus.com
export const CATEGORIES = [
  {
    id: 'ai',
    name: 'Artificial Intelligence',
    slug: 'ai',
    description: 'General AI tools, chatbots, and assistants',
    icon: '🤖',
  },
  {
    id: 'ai-writing',
    name: 'AI Writing',
    slug: 'ai-writing',
    description: 'AI-powered writing assistants, content generators, and text tools',
    icon: '✍️',
  },
  {
    id: 'ai-image-generation',
    name: 'AI Image Generation',
    slug: 'ai-image-generation',
    description: 'AI tools for creating, editing, and enhancing images',
    icon: '🎨',
  },
  {
    id: 'ai-video-creation',
    name: 'AI Video Creation',
    slug: 'ai-video-creation',
    description: 'AI-powered video editing, generation, and enhancement tools',
    icon: '🎥',
  },
  {
    id: 'ai-coding-assistants',
    name: 'Developer Tools',
    slug: 'developer-tools',
    description: 'AI tools for code generation, debugging, and development',
    icon: '💻',
  },
  {
    id: 'ai-productivity-tools',
    name: 'Productivity',
    slug: 'productivity',
    description: 'AI assistants for task management, automation, and workflow optimization',
    icon: '⚡',
  },
  {
    id: 'ai-marketing-tools',
    name: 'Marketing Tools',
    slug: 'marketing-tools',
    description: 'AI-powered marketing, SEO, and advertising tools',
    icon: '📈',
  },
  {
    id: 'saas',
    name: 'SaaS',
    slug: 'saas',
    description: 'Software as a Service products and platforms',
    icon: '☁️',
  },
  {
    id: 'analytics',
    name: 'Analytics',
    slug: 'analytics',
    description: 'Data analytics, business intelligence, and insights tools',
    icon: '📊',
  },
  {
    id: 'design-tools',
    name: 'Design Tools',
    slug: 'design-tools',
    description: 'UI/UX design, graphic design, and creative tools',
    icon: '🎨',
  },
  {
    id: 'no-code',
    name: 'No-Code',
    slug: 'no-code',
    description: 'No-code and low-code development platforms',
    icon: '🔧',
  },
  {
    id: 'api',
    name: 'APIs & Integrations',
    slug: 'api',
    description: 'API tools, integrations, and developer services',
    icon: '🔌',
  },
  {
    id: 'security',
    name: 'Security',
    slug: 'security',
    description: 'Cybersecurity, privacy, and protection tools',
    icon: '🔒',
  },
  {
    id: 'finance',
    name: 'Finance & FinTech',
    slug: 'finance',
    description: 'Financial tools, cryptocurrency, and fintech solutions',
    icon: '💰',
  },
  {
    id: 'education',
    name: 'Education',
    slug: 'education',
    description: 'EdTech, learning platforms, and educational tools',
    icon: '📚',
  },
  {
    id: 'health',
    name: 'Health Tech',
    slug: 'health',
    description: 'Healthcare, wellness, and medical technology',
    icon: '🏥',
  },
]

// Helper function to get category by slug
export const getCategoryBySlug = (slug) => {
  return CATEGORIES.find(cat => cat.slug === slug)
}

// Helper function to get category by id
export const getCategoryById = (id) => {
  return CATEGORIES.find(cat => cat.id === id)
}

// Get all category slugs for static paths
export const getAllCategorySlugs = () => {
  return CATEGORIES.map(cat => cat.slug)
}

// AI Tool Schema (for reference)
export const AI_TOOL_SCHEMA = {
  id: '',                 // Auto-generated
  name: '',               // Tool name
  tagline: '',            // Short description
  description: '',        // Full description
  website_url: '',        // Official website
  logo_url: '',           // Logo image URL
  category: '',           // Category ID
  tags: [],               // Array of tags
  upvotes: 0,             // Number of upvotes
  featured: false,        // Featured tool flag
  created_at: null,       // Timestamp (launch date)
  submitter_email: '',    // Submitter's email
  hasVoted: [],           // Array of user IDs who voted
  slug: '',               // URL-friendly slug
}

// Generate slug from tool name
export const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}
