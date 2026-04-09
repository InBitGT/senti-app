import { Toast, ToastTitle } from '@/components/ui/toast';
import React from 'react';

interface Props {
  Icon: React.ElementType;
  toastId: string;
  message: string;
}

export const CustomToast: React.FC<Props> = ({ Icon, toastId, message }) => {
  return (
    <Toast
      nativeID={toastId}
      className="px-5 py-3 gap-4 shadow-soft-1 items-center flex-row"
    >
      <Icon className="fill-typography-100 stroke-none" />

      <ToastTitle size="sm">{message}</ToastTitle>
    </Toast>
  );
};