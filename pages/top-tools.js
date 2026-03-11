// Redirect to leaderboard - alias for /top-tools
export default function TopTools() {
  return null
}

export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/leaderboard',
      permanent: true,
    },
  }
}
