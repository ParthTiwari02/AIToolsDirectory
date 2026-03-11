import styled from "@emotion/styled"

const SkeletonItem = styled.li`
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  border-radius: 8px;
`

const SkeletonContent = styled.div`
  display: grid;
  grid-template-columns: 80px 1fr;
  gap: 1.5rem;
  flex: 1;

  @media (max-width: 480px) {
    grid-template-columns: 60px 1fr;
    gap: 1rem;
  }
`

const SkeletonLogo = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 12px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;

  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  @media (max-width: 480px) {
    width: 60px;
    height: 60px;
  }
`

const SkeletonDetails = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.5rem;
`

const SkeletonLine = styled.div`
  height: ${props => props.height || "16px"};
  width: ${props => props.width || "100%"};
  border-radius: 4px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
`

const SkeletonUpvote = styled.div`
  width: 60px;
  height: 70px;
  border-radius: 8px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
`

export function AIToolCardSkeleton() {
  return (
    <SkeletonItem>
      <SkeletonContent>
        <SkeletonLogo />
        <SkeletonDetails>
          <SkeletonLine height="18px" width="60%" />
          <SkeletonLine height="14px" width="80%" />
          <SkeletonLine height="12px" width="40%" />
        </SkeletonDetails>
      </SkeletonContent>
      <SkeletonUpvote />
    </SkeletonItem>
  )
}

export function AIToolListSkeleton({ count = 5, loading = true }) {
  if (!loading) return null

  return (
    <>
      {[...Array(count)].map((_, index) => (
        <AIToolCardSkeleton key={index} />
      ))}
    </>
  )
}

export default AIToolCardSkeleton
