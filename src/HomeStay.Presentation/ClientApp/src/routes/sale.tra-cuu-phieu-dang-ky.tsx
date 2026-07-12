import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/sale/tra-cuu-phieu-dang-ky')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/sale/tra-cuu-phieu-dang-ky"!</div>
}
