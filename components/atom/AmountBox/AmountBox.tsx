import { Text } from "@/components/ui/text";
import { StyleSheet, View } from "react-native";

const formatCurrency = (value: number) =>
  `Q${value.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const AmountBox = ({
  movementType,
  amount,
  balanceAfter,
}: {
  movementType: string;
  amount: number;
  balanceAfter: number;
}) => {
  const isCharge = movementType === "charge";
  const color = isCharge ? "#dc2626" : "#16a34a";

  return (
    <View style={styles.amountBox}>
      <View style={{ flex: 1 }}>
        <Text style={styles.statLabel}>{isCharge ? "Cargo" : "Pago"}</Text>
        <Text style={[styles.amountValue, { color }]}>
          {isCharge ? "+" : "-"}
          {formatCurrency(amount)}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.statLabel}>Saldo después</Text>
        <Text style={styles.amountValue}>{formatCurrency(balanceAfter)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  amountBox: {
    flexDirection: "row",
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 8,
    gap: 8,
  },
  statLabel: { fontSize: 11, color: "#6b7280", marginBottom: 2 },
  amountValue: { fontSize: 16, fontWeight: "700", color: "#111827" },
});
