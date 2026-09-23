import { AlertCircle } from "lucide-react-native";
import { forwardRef } from "react";
import {
  Platform,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

interface AppInputProps extends Omit<TextInputProps, "style"> {
  label?: string;
  errorMessage?: string;
  isDisabled?: boolean;
  /** Cuando es true, se renderiza como textarea (varias líneas). */
  multiline?: boolean;
  /** Alto del textarea cuando multiline es true. Default: 100. */
  textareaHeight?: number;
  /**
   * Override del contenedor (wrapper). Util para casos compactos donde
   * NO se quiere el ancho 100% por defecto -- por ejemplo, un input
   * angosto dentro de una fila (ej. contador de denominaciones de
   * efectivo). No afecta el layout de un AppInput "normal" de form.
   */
  containerStyle?: StyleProp<ViewStyle>;
  /**
   * Override del estilo del TextInput en si (ej. textAlign, fontSize,
   * padding mas chico). Se aplica DESPUES de los estilos base, asi que
   * puede sobreescribirlos.
   */
  inputStyle?: StyleProp<TextStyle>;
}

/**
 * Input de texto estandar de la app, construido SOLO con
 * primitivos de React Native (TextInput, View, Text, StyleSheet).
 *
 * Mismo criterio que AppSelect: no depende de gluestack-ui ni de
 * NativeWind/cssInterop, asi que se ve identico en iOS, Android,
 * Web y Tauri sin importar el estado de esa configuracion, y
 * comparte el mismo lenguaje visual (bordes, colores, tamaños de
 * texto) que AppSelect para que los formularios se vean
 * consistentes.
 *
 * Sirve tanto para inputs de una linea como para textareas
 * (usando la prop `multiline`).
 *
 * Uso basico:
 * <Controller
 *   control={control}
 *   name="amount"
 *   rules={{ required: "El monto es obligatorio." }}
 *   render={({ field: { onChange, onBlur, value } }) => (
 *     <AppInput
 *       label="Monto"
 *       placeholder="Ej. 100.00"
 *       value={value}
 *       onChangeText={onChange}
 *       onBlur={onBlur}
 *       keyboardType="decimal-pad"
 *       errorMessage={errors.amount?.message}
 *     />
 *   )}
 * />
 *
 * Como textarea:
 * <AppInput
 *   label="Descripción"
 *   placeholder="Ej. Corrección de abono ingresado por error"
 *   value={value}
 *   onChangeText={onChange}
 *   onBlur={onBlur}
 *   multiline
 *   textareaHeight={120}
 *   errorMessage={errors.description?.message}
 * />
 */
export const AppInput = forwardRef<TextInput, AppInputProps>(function AppInput(
  {
    label,
    errorMessage,
    isDisabled,
    multiline,
    textareaHeight = 100,
    editable,
    containerStyle,
    inputStyle,
    ...props
  },
  ref,
) {
  const disabled = isDisabled || editable === false;

  return (
    <View style={[styles.wrapper, containerStyle]}>
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
          inputStyle,
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
