import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/manager/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/manager/dashboard"!</div>
}
