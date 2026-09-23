import { AlertCircle } from "lucide-react-native";
import { forwardRef } from "react";
import {
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    View,
} from "react-native";

interface AppInputProps extends Omit<TextInputProps, "style"> {
  label?: string;
  errorMessage?: string;
  isDisabled?: boolean;
  /** Cuando es true, se renderiza como textarea (varias líneas). */
  multiline?: boolean;
  /** Alto del textarea cuando multiline es true. Default: 100. */
  textareaHeight?: number;
}

export const AppInput = forwardRef<TextInput, AppInputProps>(function AppInput(
  {
    label,
    errorMessage,
    isDisabled,
    multiline,
    textareaHeight = 100,
    editable,
    ...props
  },
  ref,
) {
  const disabled = isDisabled || editable === false;

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TextInput
        ref={ref}
        editable={!disabled}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
        placeholderTextColor="#9ca3af"
        style={[
          styles.input,
          multiline && { height: textareaHeight, paddingTop: 12 },
          !!errorMessage && styles.inputError,
          disabled && styles.inputDisabled,
        ]}
        {...props}
      />

      {!!errorMessage && (
        <View style={styles.errorRow}>
          <AlertCircle size={14} color="#dc2626" />
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingVertical: Platform.OS === "ios" ? 12 : 10,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    fontSize: 14,
    color: "#171717",
  },
  inputError: {
    borderColor: "#dc2626",
  },
  inputDisabled: {
    backgroundColor: "#f3f4f6",
    opacity: 0.6,
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  errorText: {
    color: "#dc2626",
    fontSize: 12,
  },
});
