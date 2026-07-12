import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/accountant/tra-cuu-phong')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/accountant/tra-cuu-phong"!</div>
}
