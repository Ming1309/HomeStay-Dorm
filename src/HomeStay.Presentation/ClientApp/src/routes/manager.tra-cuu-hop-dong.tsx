import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/manager/tra-cuu-hop-dong')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/manager/tra-cuu-hop-dong"!</div>
}
