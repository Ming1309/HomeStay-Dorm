import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/sale/tra-cuu-phong')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/sale/tra-cuu-phong"!</div>
}
