import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/accountant/receipts')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/accountant/receipts"!</div>
}
