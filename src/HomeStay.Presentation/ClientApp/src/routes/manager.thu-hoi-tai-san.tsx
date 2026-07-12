import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/manager/thu-hoi-tai-san')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/manager/thu-hoi-tai-san"!</div>
}
