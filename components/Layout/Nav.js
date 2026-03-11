import { useState } from "react"
import Link from "next/link"
import styled from "@emotion/styled"
import { CATEGORIES } from "../../utils/categories"

const Navigation = styled.nav`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.25rem;
  padding: 0 2rem;

  @media (max-width: 1100px) {
    display: none;
  }
`

const NavLink = styled.a`
  background-color: transparent;
  text-decoration: none;
  color: #4b587c;
  font-size: 16px;
  line-height: 24px;
  font-weight: 400;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: var(--orange);
  }
`

const DropdownContainer = styled.div`
  position: relative;
`

const DropdownTrigger = styled.button`
  background-color: transparent;
  border: none;
  color: #4b587c;
  font-size: 16px;
  line-height: 24px;
  font-weight: 400;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0;
  transition: color 0.2s ease;

  &:hover {
    color: var(--orange);
  }

  &::after {
    content: '';
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-top: 5px solid currentColor;
    transition: transform 0.2s ease;
    transform: ${props => props.isOpen ? 'rotate(180deg)' : 'rotate(0)'};
  }
`

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 0.75rem;
  background-color: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  min-width: 280px;
  padding: 0.5rem;
  z-index: 100;
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transform: translateX(-50%) translateY(${props => props.isOpen ? '0' : '-10px'});
  transition: all 0.2s ease;
`

const DropdownItem = styled.a`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  text-decoration: none;
  color: #21293c;
  border-radius: 8px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #f9fafb;
  }
`

const CategoryIcon = styled.span`
  font-size: 1.25rem;
`

const CategoryName = styled.span`
  font-size: 14px;
  font-weight: 500;
`

const Nav = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isExploreOpen, setIsExploreOpen] = useState(false)

  return (
    <Navigation>
      <Link href="/" legacyBehavior>
        <NavLink>Home</NavLink>
      </Link>
      <DropdownContainer 
        onMouseEnter={() => setIsExploreOpen(true)}
        onMouseLeave={() => setIsExploreOpen(false)}
      >
        <DropdownTrigger isOpen={isExploreOpen}>
          Explore
        </DropdownTrigger>
        <DropdownMenu isOpen={isExploreOpen}>
          <Link href="/discover" passHref legacyBehavior>
            <DropdownItem>
              <CategoryIcon>🔥</CategoryIcon>
              <CategoryName>Discover</CategoryName>
            </DropdownItem>
          </Link>
          <Link href="/leaderboard" passHref legacyBehavior>
            <DropdownItem>
              <CategoryIcon>🏆</CategoryIcon>
              <CategoryName>Leaderboard</CategoryName>
            </DropdownItem>
          </Link>
          <Link href="/collections" passHref legacyBehavior>
            <DropdownItem>
              <CategoryIcon>📚</CategoryIcon>
              <CategoryName>Collections</CategoryName>
            </DropdownItem>
          </Link>
          <Link href="/weekly-best" passHref legacyBehavior>
            <DropdownItem>
              <CategoryIcon>📰</CategoryIcon>
              <CategoryName>Weekly Best</CategoryName>
            </DropdownItem>
          </Link>
          <Link href="/trending" passHref legacyBehavior>
            <DropdownItem>
              <CategoryIcon>📈</CategoryIcon>
              <CategoryName>Trending</CategoryName>
            </DropdownItem>
          </Link>
          <Link href="/winners" passHref legacyBehavior>
            <DropdownItem>
              <CategoryIcon>🥇</CategoryIcon>
              <CategoryName>Winners</CategoryName>
            </DropdownItem>
          </Link>
        </DropdownMenu>
      </DropdownContainer>
      <DropdownContainer 
        onMouseEnter={() => setIsDropdownOpen(true)}
        onMouseLeave={() => setIsDropdownOpen(false)}
      >
        <DropdownTrigger isOpen={isDropdownOpen}>
          Categories
        </DropdownTrigger>
        <DropdownMenu isOpen={isDropdownOpen}>
          {CATEGORIES.map(category => (
            <Link key={category.id} href={`/category/${category.slug}`} passHref legacyBehavior>
              <DropdownItem>
                <CategoryIcon>{category.icon}</CategoryIcon>
                <CategoryName>{category.name}</CategoryName>
              </DropdownItem>
            </Link>
          ))}
        </DropdownMenu>
      </DropdownContainer>
    </Navigation>
  )
}

export default Nav
