import { Text } from "@/components/ui/text";
import { StyleSheet, View } from "react-native";

const getDaysRemaining = (dueDate: string): number => {
  const due = new Date(dueDate);
  const today = new Date();
  due.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diffMs = due.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
};

export const DueDateBadge = ({ dueDate }: { dueDate: string }) => {
  const days = getDaysRemaining(dueDate);
  const isOverdue = days < 0;
  const isSoon = days >= 0 && days <= 5;

  const bg = isOverdue ? "#fee2e2" : isSoon ? "#fef9c3" : "#dcfce7";
  const color = isOverdue ? "#dc2626" : isSoon ? "#a16207" : "#16a34a";
  const label = isOverdue
    ? `Vencido hace ${Math.abs(days)} día${Math.abs(days) === 1 ? "" : "s"}`
    : days === 0
      ? "Vence hoy"
      : `Faltan ${days} día${days === 1 ? "" : "s"}`;

  return (
    <View
      style={[styles.badge, { backgroundColor: bg, alignSelf: "flex-start" }]}
    >
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: "500" },
});
