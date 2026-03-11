import { useContext } from "react"
import Search from "../UI/Search"
import Nav from "./Nav"
import Link from "next/link"
import Button from "../UI/Button"
import styled from "@emotion/styled"
import { css } from "@emotion/core"
import FirebaseContext from "../../firebase/context"
import UserIcon from "@components/UI/UserIcon"
import { useRouter } from "next/router"

const HeaderContainer = styled.header`
  border-bottom: 1px solid var(--light-gray);
  padding: 1.25rem 2rem;
  background-color: #fff;
  display: flex;
  justify-content: space-between;
  z-index: 999;

  @media (max-width: 760px) {
    padding: 1.25rem 1rem;
  }
`

const LogoAndSearch = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;

  @media (max-width: 480px) {
    align-items: flex-start;
    gap: 1rem;
  }
`

const LogoContainer = styled.a`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  cursor: pointer;
`

const LogoIcon = styled.span`
  font-size: 1.75rem;
`

const LogoText = styled.span`
  font-size: 1.25rem;
  font-weight: 700;
  color: #21293c;
  
  @media (max-width: 600px) {
    display: none;
  }
`

const NavContainer = styled.div`
  display: flex;
`

const UserIconContainer = styled.div`
  background-color: var(--orange);
  display: flex;
  border-radius: 100%;
  width: 40px;
  aspect-ratio: 1;
  cursor: pointer;
  overflow: hidden;
  justify-content: center;
  align-items: center;

  svg,
  img {
    width: 100%; 
    padding: 0;
    margin: 0;
    object-fit: cover;
  }
`

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`

const SubmitButton = styled.a`
  background: linear-gradient(135deg, #ff6154 0%, #ff9a8b 100%);
  color: white;
  padding: 0.6rem 1.25rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 97, 84, 0.4);
  }

  @media (max-width: 600px) {
    padding: 0.5rem 0.75rem;
    font-size: 13px;
  }
`

const NotificationBell = styled.a`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f3f4f6;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s ease;

  &:hover {
    background: #e5e7eb;
  }

  span {
    font-size: 1.25rem;
  }
`

const UnreadDot = styled.div`
  position: absolute;
  top: 6px;
  right: 6px;
  width: 10px;
  height: 10px;
  background: #ff6154;
  border-radius: 50%;
  border: 2px solid white;
`

const AUTH_PAGES = ["signin", "signup"]

const Header = () => {
  const { user } = useContext(FirebaseContext)

  const { pathname } = useRouter()
  const parsedPathname = pathname.slice(1)


  return (
    <HeaderContainer>
      <NavContainer>
        <LogoAndSearch>
          <Link href="/" legacyBehavior>
            <LogoContainer>
              <LogoIcon>🤖</LogoIcon>
              <LogoText>AI Tools Directory</LogoText>
            </LogoContainer>
          </Link>
          <Search />
        </LogoAndSearch>
        <Nav />
      </NavContainer>
      <RightSection>
        <Link href="/posts/new" legacyBehavior>
          <SubmitButton>Submit Tool</SubmitButton>
        </Link>
        {user && (
          <>
            <Link href="/notifications" legacyBehavior>
              <NotificationBell>
                <span>🔔</span>
              </NotificationBell>
            </Link>
            <Link href={`/my/details/edit`} legacyBehavior>
              <UserIconContainer>
                {user.photoURL ? <img src={user.photoURL} /> : <UserIcon />}
              </UserIconContainer>
            </Link>
          </>
        )}
        {!user && !AUTH_PAGES.includes(parsedPathname) && (
          <Link href="/signin" legacyBehavior>
            <Button>Sign in</Button>
          </Link>
        )}
        {!user && AUTH_PAGES.includes(parsedPathname) && (
          <Link href="/" legacyBehavior>
            <Button>Go back</Button>
          </Link>
        )}
      </RightSection>
    </HeaderContainer>
  );
}

export default Header
