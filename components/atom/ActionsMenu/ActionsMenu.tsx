import { useState } from "react";
import { IconButton, Menu } from "react-native-paper";

export interface Action<T> {
  icon: string;
  label: string;
  onPress: (row: T) => void;
  color?: string;
}

export function ActionsMenu<T>({
  row,
  actions,
}: {
  row: T;
  actions: Action<T>[];
}) {
  const [visible, setVisible] = useState(false);

  return (
    <Menu
      visible={visible}
      onDismiss={() => setVisible(false)}
      anchor={
        <IconButton
          icon="dots-vertical"
          size={20}
          onPress={() => setVisible(true)}
        />
      }
    >
      {actions.map((action, i) => (
        <Menu.Item
          key={i}
          leadingIcon={action.icon}
          title={action.label}
          titleStyle={action.color ? { color: action.color } : undefined}
          onPress={() => {
            action.onPress(row);
            setVisible(false);
          }}
        />
      ))}
    </Menu>
  );
}