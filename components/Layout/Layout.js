import Head from "next/head"
import { Global, css } from "@emotion/core"

import Header from "./Header"
import SEOHead from "../UI/SEOHead"

const Layout = ({ 
  children,
  title,
  description,
  keywords,
  ogImage,
  noindex
}) => {
  return (
    <>
      <SEOHead 
        title={title}
        description={description}
        keywords={keywords}
        ogImage={ogImage}
        noindex={noindex}
      />
      <Head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css"
          integrity="sha512-NhSC1YmyruXifcj/KFRWoC561YpHpc5Jtzgvbuzx5VozKpWvQ+4nXhPdFgmx8xqexRcpAglTj9sIBWINXa8x5w=="
          crossOrigin="anonymous"
        />
        <link href="/static/app.css" rel="stylesheet" />
      </Head>
      <Header />
      <main>{children}</main>
    </>
  )
}

export default Layout
