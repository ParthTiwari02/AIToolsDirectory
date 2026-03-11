import Head from "next/head"

const SEOHead = ({
  title = "AI Tools Directory - Discover the Best AI Tools",
  description = "Discover, explore, and launch the best AI tools. Find AI-powered solutions for writing, image generation, video creation, coding, productivity, and marketing.",
  keywords = "AI tools, artificial intelligence, AI software, machine learning tools",
  ogImage = "/og-image.png",
  ogType = "website",
  canonicalUrl,
  noindex = false,
}) => {
  const siteName = "AI Tools Directory"
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`

  return (
    <Head>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Robots */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}
      
      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />
      
      {/* Theme Color */}
      <meta name="theme-color" content="#ff6154" />
    </Head>
  )
}

export default SEOHead
