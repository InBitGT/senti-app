import { createTicketJob } from "@/src/service/printer/jobs/createTicketJob";
import { useAuthStore } from "@/src/store";
import { PaymentMethod } from "@/src/types/payment_methods/payment_methods";
import { Vaucher, VaucherPayment } from "@/src/types/vaucher/vaucher";
import {
  PAPER_COLUMNS,
  twoColumns,
  wrapText,
} from "@/src/utils/printer/escpos";

function money(value: number): string {
  return `Q${(value ?? 0).toFixed(2)}`;
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function methodName(
  payment: VaucherPayment,
  methods: PaymentMethod[] | undefined,
): string {
  if (!payment.payment_method_id) return "Crédito";
  return (
    methods?.find((m) => m.id === payment.payment_method_id)?.method ??
    `Método #${payment.payment_method_id}`
  );
}

/** Empresa y sucursal de la sesión actual (para el encabezado). */
function businessInfo(branchId: number) {
  const claims = useAuthStore.getState().claims;
  return {
    company: claims?.tenant_name?.trim() || "Senti",
    branch:
      claims?.branches?.find((b) => b.branch_id === branchId)?.branch_name ??
      null,
  };
}

/**
 * Comprobante de la venta (voucher) con los datos que devuelve el checkout.
 *
 * @param paymentMethods Catálogo de métodos de pago para mostrar el nombre
 *   en vez del id (opcional).
 */
export function saleVoucherJob(
  order: Vaucher,
  { paymentMethods }: { paymentMethods?: PaymentMethod[] } = {},
) {
  return createTicketJob(`Comprobante de venta #${order.id}`, (b) => {
    const { company, branch } = businessInfo(order.branch_id);

    // Encabezado: el nombre se agranda solo si cabe; si no, se parte en
    // renglones de tamaño normal sin cortarse.
    b.title(company);
    b.align("center");
    if (branch) wrapText(branch, PAPER_COLUMNS).forEach((l) => b.line(l));
    b.line("Comprobante de venta").align("left").separator();

    b.line(twoColumns(`Orden #${order.id}`, formatDate(order.created_at)));
    b.line(
      order.customer_id
        ? `Cliente #${order.customer_id}`
        : "Cliente: Público general",
    );
    b.separator();

    order.items.forEach((item) => {
      const name = item.variant_name
        ? `${item.product_name} (${item.variant_name})`
        : item.product_name;
      b.bold(true);
      wrapText(name, PAPER_COLUMNS).forEach((line) => b.line(line));
      b.bold(false);
      b.line(
        twoColumns(
          `  ${item.quantity} x ${money(item.unit_price)}`,
          money(item.subtotal),
        ),
      );
      if (item.discount > 0) {
        b.line(twoColumns("  Descuento", `-${money(item.discount)}`));
      }
    });

    b.separator();
    b.line(twoColumns("Subtotal", money(order.subtotal)));
    if (order.total_discount > 0) {
      b.line(twoColumns("Descuento", `-${money(order.total_discount)}`));
    }
    if (order.tax > 0) b.line(twoColumns("Impuesto", money(order.tax)));
    // Total en doble ancho y alto (proporcional), no solo doble alto.
    b.amountRow("TOTAL", money(order.total), { large: true });

    if (order.payments.length > 0) {
      b.separator();
      order.payments.forEach((payment) => {
        b.line(
          twoColumns(
            methodName(payment, paymentMethods),
            money(payment.amount),
          ),
        );
        if (payment.reference) {
          wrapText(`Ref: ${payment.reference}`, PAPER_COLUMNS - 2).forEach(
            (l) => b.line(`  ${l}`),
          );
        }
      });
      const change = order.payments.reduce(
        (sum, p) => sum + (p.change_amount ?? 0),
        0,
      );
      if (change > 0.005) b.amountRow("Cambio", money(change));
    }

    b.separator().align("center").line("¡Gracias por su compra!").align("left");
  });
}
