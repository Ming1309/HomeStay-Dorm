import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/approval')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/approval"!</div>
}
