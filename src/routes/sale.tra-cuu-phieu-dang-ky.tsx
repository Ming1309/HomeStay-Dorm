import { createFileRoute } from '@tanstack/react-router';
import { SaleShell } from '@/components/app/SaleShell';
import { RegistrationLookupWorkspace } from '@/components/registration/RegistrationLookupWorkspace';

export const Route = createFileRoute('/sale/tra-cuu-phieu-dang-ky')({
  component: SaleRegistrationLookupPage,
});

function SaleRegistrationLookupPage() {
  return (
    <SaleShell currentPath="/sale/tra-cuu-phieu-dang-ky" showWorkspaceNav>
      <RegistrationLookupWorkspace />
    </SaleShell>
  );
}
