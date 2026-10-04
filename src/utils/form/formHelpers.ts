const INTEGER_REGEX = /^\d+$/;
const DECIMAL_REGEX = /^-?\d+([.,]\d+)?$/;

export const toText = (value: number | null | undefined): string =>
  value === null || value === undefined ? "" : String(value);

export const toNumber = (value: string): number =>
  Number(value.trim().replace(",", "."));

export const toNullable = (value: string): string | null => {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

export const validateInteger = (value: string): true | string =>
  INTEGER_REGEX.test(value.trim()) || "Ingresa un número entero válido.";

export const validateDecimal = (value: string): true | string =>
  DECIMAL_REGEX.test(value.trim()) || "Ingresa un número válido.";

export const validateFactor = (value: string): true | string => {
  const decimalResult = validateDecimal(value);
  if (decimalResult !== true) return decimalResult;
  const parsed = toNumber(value);
  return (parsed >= 0 && parsed <= 1) || "Debe estar entre 0 y 1.";
};

export const formatCurrency = (value: number | null | undefined): string =>
  value === null || value === undefined ? "—" : `Q ${value.toFixed(2)}`;
