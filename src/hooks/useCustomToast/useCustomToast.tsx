import { CustomToast } from "@/components";
import { useToast } from "@/components/ui/toast";
import { BadgeCheck, CircleAlert, Info, LucideIcon } from "lucide-react-native";
import { useCallback } from "react";

type ToastType = "success" | "error" | "info";

const TOAST_ICONS: Record<ToastType, LucideIcon> = {
  success: BadgeCheck,
  error: CircleAlert,
  info: Info,
};

interface ShowToastProps {
  message: string;
  type?: ToastType;
  icon?: LucideIcon;
  duration?: number;
}

export const useCustomToast = () => {
  const toast = useToast();

  const showToast = useCallback(
    ({ message, type = "success", icon, duration = 3000 }: ShowToastProps) => {
      const Icon = icon ?? TOAST_ICONS[type];
      const newId = Math.random().toString();

      toast.show({
        id: newId,
        placement: "bottom right",
        duration,
        render: ({ id }) => (
          <CustomToast toastId={"toast-" + id} Icon={Icon} message={message} />
        ),
      });
    },
    [toast],
  );

  return { showToast };
};
