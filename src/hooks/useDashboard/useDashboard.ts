import { dashboardFn } from "@/src/service/dashboard/dashboard";
import { useMutation } from "@tanstack/react-query";

export const useDashboard = () => {
  const alertInventory = useMutation({
    mutationFn: dashboardFn,
    mutationKey: ["dashboard-alert-inventory"],
  });

  return { alertInventory };
};
