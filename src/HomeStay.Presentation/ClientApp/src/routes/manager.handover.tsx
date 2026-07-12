import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/manager/handover')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/manager/handover"!</div>
}
