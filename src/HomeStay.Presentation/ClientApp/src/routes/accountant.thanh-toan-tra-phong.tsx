import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/accountant/thanh-toan-tra-phong')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/accountant/thanh-toan-tra-phong"!</div>
}
