import { usePrinterConnection } from "@/src/hooks/usePrinterConnection/usePrinterConnection";
import { router } from "expo-router";
import { AlertTriangle, RefreshCw } from "lucide-react-native";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const COLORS = {
  error: { bg: "#FEF2F2", border: "#FECACA", text: "#991B1B", icon: "#DC2626" },
};

/**
 * Aviso en pantalla cuando la impresora térmica de confianza no responde.
 * Si no hay impresora configurada no muestra nada. Solo en Android.
 */
export function PrinterStatusBanner() {
  const { supported, hydrated, printer, status, error, isChecking, check } =
    usePrinterConnection();

  if (!supported || !hydrated || !printer) return null;

  const openSettings = () =>
    router.push({
      pathname: "/(drawer)/profile",
      params: { section: "printer" },
    });

  // Mientras reintenta después de un error, se mantiene el aviso visible.
  const failed = status === "error" || (isChecking && !!error);
  if (!failed) return null;

  return (
    <Banner
      tone="error"
      icon={<AlertTriangle size={18} color={COLORS.error.icon} />}
      title={`Impresora desconectada: ${printer.name || printer.address}`}
      detail={
        error ??
        "Verifica que esté encendida, con papel y cerca del dispositivo."
      }
      actions={
        <>
          <BannerButton
            tone="error"
            label={isChecking ? "Verificando..." : "Reintentar"}
            icon={
              isChecking ? (
                <ActivityIndicator size="small" color={COLORS.error.text} />
              ) : (
                <RefreshCw size={14} color={COLORS.error.text} />
              )
            }
            disabled={isChecking}
            onPress={check}
          />
          <BannerButton
            tone="error"
            label="Configurar"
            onPress={openSettings}
          />
        </>
      }
    />
  );
}

function Banner({
  tone,
  icon,
  title,
  detail,
  actions,
}: {
  tone: keyof typeof COLORS;
  icon: React.ReactNode;
  title: string;
  detail: string;
  actions: React.ReactNode;
}) {
  const c = COLORS[tone];
  return (
    <View
      accessibilityRole="alert"
      style={[styles.banner, { backgroundColor: c.bg, borderColor: c.border }]}
    >
      <View style={styles.row}>
        {icon}
        <View style={styles.texts}>
          <Text style={[styles.title, { color: c.text }]} numberOfLines={1}>
            {title}
          </Text>
          <Text style={[styles.detail, { color: c.text }]} numberOfLines={2}>
            {detail}
          </Text>
        </View>
      </View>
      <View style={styles.actions}>{actions}</View>
    </View>
  );
}

function BannerButton({
  tone,
  label,
  icon,
  disabled,
  onPress,
}: {
  tone: keyof typeof COLORS;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  onPress: () => void;
}) {
  const c = COLORS[tone];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        { borderColor: c.border, opacity: pressed || disabled ? 0.6 : 1 },
      ]}
    >
      {icon}
      <Text style={[styles.buttonText, { color: c.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginHorizontal: 12,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexShrink: 1,
    flexGrow: 1,
    minWidth: 200,
  },
  texts: { flexShrink: 1 },
  title: { fontSize: 14, fontWeight: "600" },
  detail: { fontSize: 12, marginTop: 2 },
  actions: { flexDirection: "row", alignItems: "center", gap: 8 },
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: "#FFFFFF",
  },
  buttonText: { fontSize: 13, fontWeight: "600" },
});
