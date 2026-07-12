import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/accountant')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/accountant"!</div>
}
