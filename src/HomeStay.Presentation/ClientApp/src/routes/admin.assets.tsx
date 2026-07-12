import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/assets')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/assets"!</div>
}
