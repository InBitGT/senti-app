import { AlertCircle, X } from "lucide-react-native";
import React, { forwardRef } from "react";
import {
  Platform,
  Pressable,
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
   * NO se quiere el ancho 100% por defecto.
   */
  containerStyle?: StyleProp<ViewStyle>;
  /**
   * Override del estilo del TextInput en si (ej. textAlign, fontSize,
   * padding mas chico). Se aplica DESPUES de los estilos base.
   */
  inputStyle?: StyleProp<TextStyle>;
  /**
   * Icono opcional del lado izquierdo. Se manda ya renderizado:
   * leftIcon={<Search size={16} color="#9ca3af" />}
   * Si no se manda, no se reserva espacio.
   */
  leftIcon?: React.ReactNode;
  /**
   * Si es true, muestra una X del lado derecho cuando hay texto.
   * Al tocarla limpia el contenido (llama onChangeText("")).
   */
  clearable?: boolean;
  /** Callback extra al limpiar con la X (opcional). */
  onClear?: () => void;
  /**
   * Componente de input a usar internamente. Default: TextInput.
   * Dentro de un BottomSheet pasa BottomSheetTextInput.
   */
  TextInputComponent?: React.ComponentType<any>;
}

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
    leftIcon,
    clearable = true,
    onClear,
    value,
    onChangeText,
    TextInputComponent,
    ...props
  },
  ref,
) {
  const InputComponent: React.ComponentType<any> =
    TextInputComponent ?? TextInput;

  const disabled = isDisabled || editable === false;
  const showClear = !!clearable && !disabled && !!value && value.length > 0;

  const handleClear = () => {
    onChangeText?.("");
    onClear?.();
  };

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View
        style={[
          styles.inputContainer,
          multiline && { alignItems: "flex-start" },
          !!errorMessage && styles.inputError,
          disabled && styles.inputDisabled,
        ]}
      >
        {!!leftIcon && (
          <View style={[styles.leftIcon, multiline && styles.iconMultiline]}>
            {leftIcon}
          </View>
        )}

        <InputComponent
          // ref={ref}
          value={value}
          onChangeText={onChangeText}
          editable={!disabled}
          multiline={multiline}
          textAlignVertical={multiline ? "top" : "center"}
          placeholderTextColor="#9ca3af"
          style={[
            styles.input,
            !!leftIcon && { paddingLeft: 8 },
            showClear && { paddingRight: 4 },
            multiline && { height: textareaHeight, paddingTop: 12 },
            Platform.OS === "web" && ({ outlineStyle: "none" } as any),
            inputStyle,
          ]}
          {...props}
        />

        {showClear && (
          <Pressable
            onPress={handleClear}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={[styles.clearBtn, multiline && styles.iconMultiline]}
            accessibilityRole="button"
            accessibilityLabel="Limpiar texto"
          >
            <X size={16} color="#6b7280" />
          </Pressable>
        )}
      </View>

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
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    minWidth: 0,
    paddingTop: Platform.OS === "ios" ? 12 : 10,
    paddingBottom: Platform.OS === "ios" ? 12 : 10,
    paddingLeft: 12,
    paddingRight: 12,
    fontSize: 14,
    color: "#171717",
  },
  leftIcon: {
    paddingLeft: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  clearBtn: {
    paddingLeft: 4,
    paddingRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  iconMultiline: {
    paddingTop: 12,
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
