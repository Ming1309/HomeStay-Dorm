import { useQuery, type QueryClient } from "@tanstack/react-query";

import { dashboardKeys, dashboardService } from "@/features/dashboards/services/dashboard-service";

const staleTime = 45_000;

export function useSaleDashboard() {
  return useQuery({
    queryKey: dashboardKeys.sale(),
    queryFn: ({ signal }) => dashboardService.getSale(signal),
    staleTime,
    refetchOnWindowFocus: true,
  });
}

export function useManagerDashboard() {
  return useQuery({
    queryKey: dashboardKeys.manager(),
    queryFn: ({ signal }) => dashboardService.getManager(signal),
    staleTime,
    refetchOnWindowFocus: true,
  });
}

export function useAccountantDashboard() {
  return useQuery({
    queryKey: dashboardKeys.accountant(),
    queryFn: ({ signal }) => dashboardService.getAccountant(signal),
    staleTime,
    refetchOnWindowFocus: true,
  });
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: dashboardKeys.admin(),
    queryFn: ({ signal }) => dashboardService.getAdmin(signal),
    staleTime,
    refetchOnWindowFocus: true,
  });
}

export function invalidateDashboards(
  queryClient: QueryClient,
  roles: Array<"sale" | "manager" | "accountant" | "admin"> = [
    "sale",
    "manager",
    "accountant",
    "admin",
  ],
) {
  return Promise.all(
    roles.map((role) => {
      if (role === "sale") return queryClient.invalidateQueries({ queryKey: dashboardKeys.sale() });
      if (role === "manager")
        return queryClient.invalidateQueries({ queryKey: dashboardKeys.manager() });
      if (role === "accountant")
        return queryClient.invalidateQueries({ queryKey: dashboardKeys.accountant() });
      return queryClient.invalidateQueries({ queryKey: dashboardKeys.admin() });
    }),
  );
}
