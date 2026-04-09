import { CustomToast } from '@/components';
import { useToast } from '@/components/ui/toast';
import { BadgeCheck, CircleAlert, Info, LucideIcon } from 'lucide-react-native';
import React from 'react';

type ToastType = 'success' | 'error' | 'info';

const TOAST_ICONS: Record<ToastType, LucideIcon> = {
  success: BadgeCheck,
  error: CircleAlert,
  info: Info,
};

interface ShowToastProps {
  message: string;
  type?: ToastType;
  icon?: LucideIcon;
}

export const useCustomToast = () => {
  const toast = useToast();

  const showToast = ({ message, type = 'success', icon }: ShowToastProps) => {
    const Icon = icon ?? TOAST_ICONS[type];

    toast.show({
      placement: 'top',
      render: ({ id }) => {
        const toastId = 'toast-' + id;
        return (
          <CustomToast toastId={toastId} Icon={Icon} message={message} />
        ) as React.ReactNode;
      },
    });
  };

  return { showToast };
};