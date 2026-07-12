import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/sale/tra-cuu-hop-dong')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/sale/tra-cuu-hop-dong"!</div>
}
