import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/manager/approval')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/manager/approval"!</div>
}
