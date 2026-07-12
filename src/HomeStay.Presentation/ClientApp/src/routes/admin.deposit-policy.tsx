import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/deposit-policy')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/deposit-policy"!</div>
}
