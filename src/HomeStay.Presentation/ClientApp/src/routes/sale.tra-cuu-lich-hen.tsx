import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/sale/tra-cuu-lich-hen')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/sale/tra-cuu-lich-hen"!</div>
}
