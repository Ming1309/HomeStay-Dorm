import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/regulations')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/regulations"!</div>
}
