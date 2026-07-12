import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/residence')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/residence"!</div>
}
