import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/accountant/payments')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/accountant/payments"!</div>
}
