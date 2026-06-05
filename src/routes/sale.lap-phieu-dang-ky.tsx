import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { SaleShell } from '@/components/app/SaleShell';
import { RegistrationForm } from '@/components/registration/RegistrationForm';
import { toast } from 'sonner';

export const Route = createFileRoute('/sale/lap-phieu-dang-ky')({
  component: RegistrationPage,
});

function RegistrationPage() {
  const navigate = useNavigate();

  return (
    <SaleShell currentPath="/sale/lap-phieu-dang-ky" showWorkspaceNav>
      <RegistrationForm
        onSuccess={(data) => {
          console.log('✅ Registration created:', data);
          toast.success('Phiếu đăng ký được tạo thành công!');
          // Navigate back to dashboard after 2 seconds
          setTimeout(() => {
            navigate({ to: '/sale/dashboard' });
          }, 2000);
        }}
        onCancel={() => {
          console.log('❌ Form cancelled');
          navigate({ to: '/sale/dashboard' });
        }}
      />
    </SaleShell>
  );
}
