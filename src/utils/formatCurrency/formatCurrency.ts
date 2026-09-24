export const formatCurrency = (value: number | null | undefined) => {
  const safeValue = typeof value === "number" && !isNaN(value) ? value : 0;
  return `Q${safeValue.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
