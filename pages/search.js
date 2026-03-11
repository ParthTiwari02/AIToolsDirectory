import { useEffect, useState, useContext } from "react"
import { useRouter } from "next/router"
import styled from "@emotion/styled"
import Link from "next/link"

import Layout from "@components/Layout/Layout"
import { AIToolCard, AIToolListSkeleton } from "@components/AITool"
import { FirebaseContext } from "../firebase/index"

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`

const Header = styled.div`
  margin-bottom: 2rem;
`

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  color: #21293c;
  margin: 0 0 0.5rem 0;
`

const SearchQuery = styled.span`
  color: var(--orange);
`

const ResultCount = styled.p`
  color: #667190;
  margin: 0;
  font-size: 14px;
`

const ToolList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background-color: #f9fafb;
  border-radius: 12px;
`

const EmptyTitle = styled.h2`
  font-size: 1.25rem;
  color: #21293c;
  margin: 0 0 0.5rem 0;
`

const EmptyText = styled.p`
  color: #667190;
  margin: 0 0 1rem 0;
`

const SuggestionList = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  flex-wrap: wrap;
`

const SuggestionLink = styled.a`
  color: var(--orange);
  text-decoration: none;
  padding: 4px 12px;
  background-color: #fff5f4;
  border-radius: 16px;
  font-size: 14px;

  &:hover {
    background-color: #ffebe8;
  }
`

const SearchPage = () => {
  const router = useRouter()
  const { firebase } = useContext(FirebaseContext)
  
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(true)

  const { q } = router.query

  useEffect(() => {
    if (!q || !firebase) {
      setLoading(false)
      return
    }

    const searchTools = async () => {
      setLoading(true)
      try {
        // Fetch all tools and filter client-side
        // Note: For production, consider using Algolia or a dedicated search service
        const snapshot = await firebase.db
          .collection("ai_tools")
          .orderBy("upvotes", "desc")
          .get()

        const query = q.toLowerCase()
        const results = []

        snapshot.forEach(doc => {
          const data = { id: doc.id, ...doc.data() }
          
          // Search in name
          const nameMatch = data.name?.toLowerCase().includes(query)
          
          // Search in tagline
          const taglineMatch = data.tagline?.toLowerCase().includes(query)
          
          // Search in description
          const descriptionMatch = data.description?.toLowerCase().includes(query)
          
          // Search in tags
          const tagMatch = data.tags?.some(tag => 
            tag.toLowerCase().includes(query)
          )

          if (nameMatch || taglineMatch || descriptionMatch || tagMatch) {
            results.push(data)
          }
        })

        setSearchResults(results)
      } catch (error) {
        console.error("Error searching tools:", error)
      } finally {
        setLoading(false)
      }
    }

    searchTools()
  }, [q, firebase])

  const suggestions = ["ChatGPT", "writing", "image", "coding", "video"]

  return (
    <Layout
      title={q ? `Search: ${q}` : "Search AI Tools"}
      description={`Search results for "${q}" - Find the best AI tools`}
      noindex={true}
    >
      <Container>
        <Header>
          {q ? (
            <>
              <Title>
                Search results for <SearchQuery>"{q}"</SearchQuery>
              </Title>
              {!loading && (
                <ResultCount>
                  {searchResults.length} tool{searchResults.length !== 1 ? 's' : ''} found
                </ResultCount>
              )}
            </>
          ) : (
            <Title>Search AI Tools</Title>
          )}
        </Header>

        <ToolList>
          {loading && <AIToolListSkeleton count={5} loading={true} />}

          {!loading && searchResults.length > 0 && 
            searchResults.map(tool => (
              <AIToolCard key={tool.id} tool={tool} />
            ))
          }

          {!loading && q && searchResults.length === 0 && (
            <EmptyState>
              <EmptyTitle>No results found for "{q}"</EmptyTitle>
              <EmptyText>Try searching for something else</EmptyText>
              <SuggestionList>
                {suggestions.map(suggestion => (
                  <Link key={suggestion} href={`/search?q=${suggestion}`} passHref legacyBehavior>
                    <SuggestionLink>{suggestion}</SuggestionLink>
                  </Link>
                ))}
              </SuggestionList>
            </EmptyState>
          )}

          {!loading && !q && (
            <EmptyState>
              <EmptyTitle>🔍 Search for AI Tools</EmptyTitle>
              <EmptyText>Enter a search term to find AI tools</EmptyText>
              <SuggestionList>
                {suggestions.map(suggestion => (
                  <Link key={suggestion} href={`/search?q=${suggestion}`} passHref legacyBehavior>
                    <SuggestionLink>{suggestion}</SuggestionLink>
                  </Link>
                ))}
              </SuggestionList>
            </EmptyState>
          )}
        </ToolList>
      </Container>
    </Layout>
  )
}

export default SearchPage
