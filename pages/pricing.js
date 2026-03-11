import Link from "next/link"
import styled from "@emotion/styled"
import Layout from "@components/Layout/Layout"

const Wrapper = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`

const PageHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`

const PageTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #21293c;
  margin: 0 0 1rem 0;

  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
`

const PageSubtitle = styled.p`
  font-size: 1.25rem;
  color: #667190;
  margin: 0;
  max-width: 600px;
  margin: 0 auto;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`

const PricingGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 3rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    max-width: 400px;
    margin: 0 auto 3rem auto;
  }
`

const PricingCard = styled.div`
  background: white;
  border: 2px solid ${props => props.$popular ? 'var(--orange)' : '#e5e7eb'};
  border-radius: 16px;
  padding: 2rem;
  position: relative;
  transition: transform 0.2s, box-shadow 0.2s;

  ${props => props.$popular && `
    box-shadow: 0 8px 30px rgba(255, 97, 84, 0.2);
    transform: scale(1.02);
  `}

  &:hover {
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  }
`

const PopularBadge = styled.div`
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #ff6154 0%, #ff9a8b 100%);
  color: white;
  padding: 0.375rem 1rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
`

const PlanName = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #21293c;
  margin: 0 0 0.5rem 0;
`

const PlanDescription = styled.p`
  font-size: 0.9rem;
  color: #667190;
  margin: 0 0 1.5rem 0;
`

const PriceWrapper = styled.div`
  margin-bottom: 1.5rem;
`

const Price = styled.span`
  font-size: 2.5rem;
  font-weight: 700;
  color: #21293c;
`

const PricePeriod = styled.span`
  font-size: 1rem;
  color: #667190;
`

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 2rem 0;
`

const Feature = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.5rem 0;
  font-size: 0.9rem;
  color: #4b587c;

  &::before {
    content: '✓';
    color: #10b981;
    font-weight: 700;
  }
`

const DisabledFeature = styled(Feature)`
  color: #9ca3af;
  text-decoration: line-through;

  &::before {
    content: '×';
    color: #9ca3af;
  }
`

const CTAButton = styled.a`
  display: block;
  text-align: center;
  padding: 0.875rem 1.5rem;
  background: ${props => props.$primary ? 'var(--orange)' : '#f3f4f6'};
  color: ${props => props.$primary ? 'white' : '#4b587c'};
  font-weight: 600;
  font-size: 1rem;
  border-radius: 8px;
  text-decoration: none;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`

const FAQSection = styled.section`
  margin-top: 4rem;
`

const FAQTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  color: #21293c;
  text-align: center;
  margin-bottom: 2rem;
`

const FAQGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const FAQItem = styled.div`
  background: #f9fafb;
  border-radius: 12px;
  padding: 1.5rem;
`

const FAQQuestion = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: #21293c;
  margin: 0 0 0.75rem 0;
`

const FAQAnswer = styled.p`
  font-size: 0.9rem;
  color: #667190;
  margin: 0;
  line-height: 1.6;
`

const GuaranteeSection = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  color: white;
  margin-top: 3rem;
`

const GuaranteeTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
`

const GuaranteeText = styled.p`
  font-size: 0.95rem;
  opacity: 0.9;
  margin: 0;
`

export default function PricingPage() {
  return (
    <Layout
      title="Pricing - Launch Your AI Tool"
      description="Choose your plan to launch your AI tool. Free submissions available. Premium plans for featured listings and more visibility."
    >
      <Wrapper>
        <PageHeader>
          <PageTitle>🚀 Boost Your AI Tool's Visibility</PageTitle>
          <PageSubtitle>
            Choose the right plan to get discovered by thousands of AI enthusiasts, founders, and early adopters.
          </PageSubtitle>
        </PageHeader>

        <PricingGrid>
          {/* Free Plan */}
          <PricingCard>
            <PlanName>🆓 Free Launch</PlanName>
            <PlanDescription>Perfect for getting started</PlanDescription>
            <PriceWrapper>
              <Price>$0</Price>
              <PricePeriod> / forever</PricePeriod>
            </PriceWrapper>
            <FeatureList>
              <Feature>Directory listing</Feature>
              <Feature>Tool detail page</Feature>
              <Feature>Community upvotes</Feature>
              <Feature>Basic analytics</Feature>
              <Feature>1 external link</Feature>
              <DisabledFeature>Featured placement</DisabledFeature>
              <DisabledFeature>Social media posts</DisabledFeature>
              <DisabledFeature>Newsletter feature</DisabledFeature>
            </FeatureList>
            <Link href="/posts/new" passHref legacyBehavior>
              <CTAButton>Submit Free</CTAButton>
            </Link>
          </PricingCard>

          {/* Featured Plan */}
          <PricingCard $popular>
            <PopularBadge>Most Popular</PopularBadge>
            <PlanName>⭐ Featured Launch</PlanName>
            <PlanDescription>Maximum visibility & exposure</PlanDescription>
            <PriceWrapper>
              <Price>$29</Price>
              <PricePeriod> / one-time</PricePeriod>
            </PriceWrapper>
            <FeatureList>
              <Feature>Everything in Free</Feature>
              <Feature>Featured badge</Feature>
              <Feature>Homepage featured section</Feature>
              <Feature>Priority in search results</Feature>
              <Feature>Social media announcement</Feature>
              <Feature>Newsletter mention</Feature>
              <Feature>Permanent dofollow backlink</Feature>
              <Feature>Detailed analytics</Feature>
            </FeatureList>
            <Link href="/posts/new?plan=featured" passHref legacyBehavior>
              <CTAButton $primary>Get Featured</CTAButton>
            </Link>
          </PricingCard>

          {/* Premium Plan */}
          <PricingCard>
            <PlanName>💎 Premium Launch</PlanName>
            <PlanDescription>Full marketing package</PlanDescription>
            <PriceWrapper>
              <Price>$79</Price>
              <PricePeriod> / one-time</PricePeriod>
            </PriceWrapper>
            <FeatureList>
              <Feature>Everything in Featured</Feature>
              <Feature>Dedicated blog post</Feature>
              <Feature>Multiple social posts</Feature>
              <Feature>Email blast to subscribers</Feature>
              <Feature>Priority support</Feature>
              <Feature>Re-launch eligibility</Feature>
              <Feature>Founder profile highlight</Feature>
              <Feature>Cross-promotion network</Feature>
            </FeatureList>
            <Link href="/posts/new?plan=premium" passHref legacyBehavior>
              <CTAButton>Go Premium</CTAButton>
            </Link>
          </PricingCard>
        </PricingGrid>

        <GuaranteeSection>
          <GuaranteeTitle>💯 Satisfaction Guarantee</GuaranteeTitle>
          <GuaranteeText>
            Not happy with your launch? Contact us within 7 days and we'll make it right or refund you. No questions asked.
          </GuaranteeText>
        </GuaranteeSection>

        <FAQSection>
          <FAQTitle>Frequently Asked Questions</FAQTitle>
          <FAQGrid>
            <FAQItem>
              <FAQQuestion>How does the free submission work?</FAQQuestion>
              <FAQAnswer>
                Submit your AI tool for free and get listed in our directory. Your tool will appear in chronological order and can receive upvotes from the community.
              </FAQAnswer>
            </FAQItem>
            <FAQItem>
              <FAQQuestion>What's included in Featured?</FAQQuestion>
              <FAQAnswer>
                Featured tools get a special badge, appear in the Featured section on the homepage, get priority in search results, and are shared on our social media channels.
              </FAQAnswer>
            </FAQItem>
            <FAQItem>
              <FAQQuestion>Do I get a backlink?</FAQQuestion>
              <FAQAnswer>
                Yes! All listings include dofollow backlinks. Featured and Premium plans include additional high-quality backlinks from our blog posts.
              </FAQAnswer>
            </FAQItem>
            <FAQItem>
              <FAQQuestion>Can I re-launch my tool?</FAQQuestion>
              <FAQAnswer>
                Premium plan holders can re-launch their tool after significant updates. This gives you a fresh start in the daily rankings.
              </FAQAnswer>
            </FAQItem>
            <FAQItem>
              <FAQQuestion>How long does approval take?</FAQQuestion>
              <FAQAnswer>
                Free submissions are reviewed within 24-48 hours. Featured and Premium submissions get priority review within 4-6 hours.
              </FAQAnswer>
            </FAQItem>
            <FAQItem>
              <FAQQuestion>What payment methods do you accept?</FAQQuestion>
              <FAQAnswer>
                We accept all major credit cards, debit cards, and PayPal through our secure payment processor.
              </FAQAnswer>
            </FAQItem>
          </FAQGrid>
        </FAQSection>
      </Wrapper>
    </Layout>
  )
}
