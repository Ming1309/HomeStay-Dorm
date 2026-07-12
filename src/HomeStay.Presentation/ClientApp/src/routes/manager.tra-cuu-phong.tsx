import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/manager/tra-cuu-phong')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/manager/tra-cuu-phong"!</div>
}
