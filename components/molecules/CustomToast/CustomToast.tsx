import { Toast, ToastTitle } from "@/components/ui/toast";
import React from "react";

interface Props {
  Icon: React.ElementType;
  toastId: string;
  message: string;
}

export const CustomToast: React.FC<Props> = ({ Icon, toastId, message }) => {
  return (
    <Toast
      nativeID={toastId}
      action="muted"
      variant="solid"
      className="bg-neutral-800 px-5 py-3 gap-3 rounded-xl items-center flex-row"
    >
      <Icon size={20} color="#ffffff" />
      <ToastTitle size="sm" className="text-white flex-shrink">
        {message}
      </ToastTitle>
    </Toast>
  );
};
