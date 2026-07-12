import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/rooms-beds')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/rooms-beds"!</div>
}
