import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/accountant/doi-soat')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/accountant/doi-soat"!</div>
}
