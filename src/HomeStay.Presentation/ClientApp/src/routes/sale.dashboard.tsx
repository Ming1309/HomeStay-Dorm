import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/sale/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/sale/dashboard"!</div>
}
