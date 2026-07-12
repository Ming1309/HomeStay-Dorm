import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/accountant/tra-cuu-hop-dong')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/accountant/tra-cuu-hop-dong"!</div>
}
