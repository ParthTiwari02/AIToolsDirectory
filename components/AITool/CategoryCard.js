import Link from "next/link"
import styled from "@emotion/styled"

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
`

const CategoryCardWrapper = styled.a`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background-color: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--orange);
    box-shadow: 0 4px 12px rgba(255, 97, 84, 0.15);
    transform: translateY(-2px);
  }
`

const IconContainer = styled.div`
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  background: linear-gradient(135deg, #fff5f4 0%, #ffeee9 100%);
  border-radius: 12px;
  flex-shrink: 0;
`

const CategoryInfo = styled.div`
  flex: 1;
  min-width: 0;
`

const CategoryName = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #21293c;
  margin: 0 0 0.25rem 0;
`

const CategoryDescription = styled.p`
  font-size: 0.85rem;
  color: #667190;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const ToolCount = styled.span`
  font-size: 0.75rem;
  color: #9ca3af;
  background-color: #f3f4f6;
  padding: 2px 8px;
  border-radius: 12px;
  flex-shrink: 0;
`

export function CategoryCard({ category, toolCount }) {
  return (
    <Link href={`/category/${category.slug}`} passHref legacyBehavior>
      <CategoryCardWrapper>
        <IconContainer>{category.icon}</IconContainer>
        <CategoryInfo>
          <CategoryName>{category.name}</CategoryName>
          <CategoryDescription>{category.description}</CategoryDescription>
        </CategoryInfo>
        {toolCount !== undefined && (
          <ToolCount>{toolCount} tools</ToolCount>
        )}
      </CategoryCardWrapper>
    </Link>
  )
}

export function CategorySection({ categories, title = "Browse by Category" }) {
  return (
    <section>
      <h2 className="section-title">{title}</h2>
      <CategoryGrid>
        {categories.map(cat => (
          <CategoryCard key={cat.id} category={cat} />
        ))}
      </CategoryGrid>
    </section>
  )
}

export default CategoryCard
