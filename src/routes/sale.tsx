import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/sale")({
  component: SaleLayoutRoute,
});

function SaleLayoutRoute() {
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname === "/sale") {
      navigate({ to: "/sale/dashboard" });
    }
  }, [navigate]);

  return <Outlet />;
}
