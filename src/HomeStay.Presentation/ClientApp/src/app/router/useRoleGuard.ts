import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { roleMeta } from "@/app/navigation/appNavigation";
import { useWorkflowStore, type UserRole } from "@/app/providers/workflow-store";

function homeForRole(role: UserRole) {
  return roleMeta[role].home;
}

export function useRoleGuard(expectedRole: UserRole) {
  const navigate = useNavigate();
  const { role, isHydrated } = useWorkflowStore();

  useEffect(() => {
    if (!isHydrated) return;
    if (!role) {
      navigate({ to: "/" });
      return;
    }
    if (role !== expectedRole) {
      navigate({ to: homeForRole(role) });
    }
  }, [role, expectedRole, navigate, isHydrated]);

  return isHydrated && role === expectedRole;
}
