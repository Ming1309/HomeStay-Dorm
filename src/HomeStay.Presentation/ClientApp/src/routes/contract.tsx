import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/contract')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/contract"!</div>
}
