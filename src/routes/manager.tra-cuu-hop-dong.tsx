import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/manager/tra-cuu-hop-dong")({
  component: LegacyManagerContractLookupPage,
});

function LegacyManagerContractLookupPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ to: "/manager/contracts" });
  }, [navigate]);

  return null;
}
