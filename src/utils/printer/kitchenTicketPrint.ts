import {
  KitchenOrderPrint,
  KitchenOrderPrintStation,
  KitchenTicket,
  KitchenTicketItem,
  KitchenTicketOtherStation,
  KitchenTicketModifier,
} from "@/src/types/kitchen_ticket/kitchen_ticket";
import {
  EscPosBuilder,
  PAPER_COLUMNS,
  wrapText,
} from "@/src/utils/printer/escpos";

interface TicketRow {
  text: string;
  align?: "left" | "center";
  bold?: boolean;
  tall?: boolean;
  /** Doble ancho y alto (proporcional). El texto ya viene a media columna. */
  large?: boolean;
}

const HALF_COLUMNS = Math.floor(PAPER_COLUMNS / 2);

/**
 * Encabezado que se adapta al largo: grande si cabe en 2 renglones de media
 * columna, si no, negrita normal en varios renglones (nunca se corta).
 */
function headerRows(text: string): TicketRow[] {
  const large = wrapText(text, HALF_COLUMNS);
  const fitsLarge =
    large.length <= 2 &&
    text.split(/\s+/).every((word) => word.length <= HALF_COLUMNS);
  return (fitsLarge ? large : wrapText(text, PAPER_COLUMNS)).map((line) => ({
    text: line,
    align: "center" as const,
    bold: true,
    large: fitsLarge,
  }));
}

const LINE: TicketRow = { text: "-".repeat(PAPER_COLUMNS) };
const DOUBLE_LINE: TicketRow = { text: "=".repeat(PAPER_COLUMNS) };

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function formatTicketDate(iso: string): string {
  const date = new Date(iso);
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function indented(text: string, prefix: string): string[] {
  const indent = " ".repeat(prefix.length);
  return wrapText(text, PAPER_COLUMNS - prefix.length).map(
    (line, index) => `${index === 0 ? prefix : indent}${line}`,
  );
}

function groupModifiers(modifiers: KitchenTicketModifier[]): string[] {
  const groups = new Map<string, { name: string; count: number }>();
  modifiers.forEach((modifier) => {
    const name = modifier.modifier_name || modifier.name || "Extra";
    const key = String(modifier.product_modifier_id ?? name);
    const quantity =
      modifier.quantity && modifier.quantity > 0 ? modifier.quantity : 1;
    const current = groups.get(key);
    groups.set(key, { name, count: (current?.count ?? 0) + quantity });
  });
  return [...groups.values()].map(({ name, count }) =>
    count > 1 ? `${name} x${count}` : name,
  );
}

function itemRows(item: KitchenTicketItem): TicketRow[] {
  const title = item.variant_name
    ? `${item.product_name} (${item.variant_name})`
    : item.product_name;
  return [
    ...indented(title, `${item.quantity} x `).map((text) => ({
      text,
      bold: true,
      tall: true,
    })),
    ...groupModifiers(item.modifiers).flatMap((label) =>
      indented(label, "   + ").map((text) => ({ text })),
    ),
    ...(item.notes
      ? indented(item.notes, "   * ").map((text) => ({ text }))
      : []),
  ];
}

function stationRows(station: KitchenOrderPrintStation): TicketRow[] {
  return [
    DOUBLE_LINE,
    {
      text: (station.prep_station_name || "General").toUpperCase(),
      align: "center",
      bold: true,
    },
    ...station.items.flatMap(itemRows),
  ];
}

type PrintableOrder = KitchenOrderPrint & {
  other_stations?: KitchenTicketOtherStation[];
};

function ticketRows(ticket: PrintableOrder): TicketRow[] {
  const cashier =
    `${ticket.user_first_name ?? ""} ${ticket.user_last_name ?? ""}`.trim();
  return [
    ...headerRows(ticket.branch_name || "Cocina"),
    { text: "TICKET DE COCINA", align: "center" },
    LINE,
    { text: `Orden #${ticket.order_id}` },
    { text: formatTicketDate(ticket.created_at) },
    ...(cashier ? indented(cashier, "Cajero: ").map((text) => ({ text })) : []),
    ...(ticket.customer_name
      ? indented(ticket.customer_name, "Cliente: ").map((text) => ({ text }))
      : []),
    ...ticket.stations.flatMap(stationRows),
    ...otherStationsRows(ticket.other_stations ?? []),
    LINE,
    { text: `Productos: ${ticket.total_items}` },
  ];
}

/** Lo que la misma orden lleva en otras estaciones (solo informativo). */
function otherStationsRows(others: KitchenTicketOtherStation[]): TicketRow[] {
  const withItems = others.filter((station) => station.items.length > 0);
  if (withItems.length === 0) return [];
  return [
    LINE,
    { text: "EN OTRAS ESTACIONES", align: "center" },
    ...withItems.flatMap((station) => [
      { text: (station.prep_station_name || "General").toUpperCase() },
      ...station.items.flatMap((item) =>
        indented(
          item.variant_name
            ? `${item.product_name} (${item.variant_name})`
            : item.product_name,
          `  ${item.quantity} x `,
        ).map((text) => ({ text })),
      ),
    ]),
  ];
}

/**
 * Convierte un ticket del tablero de cocina (una estación) al formato de
 * impresión de orden, para reutilizar el mismo diseño de ticket.
 */
export function kitchenTicketToPrint(
  ticket: KitchenTicket,
): KitchenOrderPrint & { other_stations?: KitchenTicketOtherStation[] } {
  return {
    order_id: ticket.order_id,
    branch_id: ticket.branch_id,
    branch_name: ticket.branch_name,
    user_id: ticket.user_id,
    user_first_name: ticket.user_first_name,
    user_last_name: ticket.user_last_name,
    customer_id: ticket.customer_id,
    customer_name: ticket.customer_name,
    channel: ticket.channel,
    created_at: ticket.created_at,
    total_items: ticket.items.reduce((sum, item) => sum + item.quantity, 0),
    stations: [
      {
        kitchen_ticket_id: ticket.id,
        prep_station_id: ticket.prep_station_id ?? null,
        prep_station_name: ticket.prep_station_name ?? "General",
        prep_station_code: ticket.prep_station_code ?? null,
        ticket_status: ticket.ticket_status,
        printed_at: ticket.printed_at,
        items: ticket.items,
      },
    ],
    other_stations: ticket.other_stations,
  };
}

export function kitchenOrderText(ticket: PrintableOrder): string {
  return ticketRows(ticket)
    .map((row) => {
      if (row.align !== "center") return row.text;
      const width = row.large ? HALF_COLUMNS : PAPER_COLUMNS;
      const left = Math.max(0, Math.floor((width - row.text.length) / 2));
      return `${" ".repeat(left)}${row.text}`;
    })
    .join("\n");
}

export function kitchenOrderBytes(ticket: PrintableOrder): Uint8Array {
  const builder = new EscPosBuilder().init();
  ticketRows(ticket).forEach((row) => {
    builder
      .align(row.align ?? "left")
      .bold(!!row.bold)
      .size(row.large ? 2 : 1, row.large || row.tall ? 2 : 1)
      .line(row.text);
  });
  return builder.bold(false).size(1, 1).align("left").feed(4).build();
}
