import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { useWorkflowStore } from "@/lib/workflow-store";

export const Route = createFileRoute("/approval")({
  component: LegacyApprovalRedirect,
});

function LegacyApprovalRedirect() {
  const navigate = useNavigate();
  const { role } = useWorkflowStore();

  useEffect(() => {
    if (role === "manager") {
      navigate({ to: "/manager/approval" });
      return;
    }
    if (role === "accountant") {
      navigate({ to: "/accountant" });
      return;
    }
    navigate({ to: "/" });
  }, [navigate, role]);

  return null;
}
