const ESC = 0x1b;
const GS = 0x1d;
const LF = 0x0a;

export const PAPER_COLUMNS = 32;

const CP437: Record<string, number> = {
  á: 0xa0,
  é: 0x82,
  í: 0xa1,
  ó: 0xa2,
  ú: 0xa3,
  ü: 0x81,
  ñ: 0xa4,
  Ñ: 0xa5,
  É: 0x90,
  Ü: 0x9a,
  "¿": 0xa8,
  "¡": 0xad,
  Á: 0x41,
  Í: 0x49,
  Ó: 0x4f,
  Ú: 0x55,
};

function encode(text: string): number[] {
  return [...text].map((char) => {
    const code = char.charCodeAt(0);
    if (code < 0x80) return code;
    return CP437[char] ?? 0x3f;
  });
}

/**
 * Parte el texto en renglones de `width` columnas. Las palabras más largas
 * que el renglón se dividen en trozos (antes se recortaban y se perdía texto).
 */
export function wrapText(text: string, width: number): string[] {
  const words = text
    .split(/\s+/)
    .filter(Boolean)
    .flatMap((word) => {
      if (word.length <= width) return [word];
      const chunks: string[] = [];
      for (let i = 0; i < word.length; i += width) {
        chunks.push(word.slice(i, i + width));
      }
      return chunks;
    });
  const lines: string[] = [];
  let current = "";
  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= width) {
      current = next;
      return;
    }
    if (current) lines.push(current);
    current = word;
  });
  if (current) lines.push(current);
  return lines;
}

/**
 * Renglón con texto a la izquierda y valor a la derecha:
 * "Subtotal              Q125.00". Si no cabe, recorta el texto izquierdo.
 */
export function twoColumns(
  left: string,
  right: string,
  width = PAPER_COLUMNS,
): string {
  const room = Math.max(0, width - right.length - 1);
  const text = left.length > room ? left.slice(0, room) : left;
  return `${text}${" ".repeat(Math.max(1, width - text.length - right.length))}${right}`;
}

export class EscPosBuilder {
  private data: number[] = [];

  init() {
    this.data.push(ESC, 0x40, ESC, 0x74, 0x00);
    return this;
  }

  align(position: "left" | "center" | "right") {
    const value = position === "left" ? 0 : position === "center" ? 1 : 2;
    this.data.push(ESC, 0x61, value);
    return this;
  }

  bold(on: boolean) {
    this.data.push(ESC, 0x45, on ? 1 : 0);
    return this;
  }

  /** Solo doble alto (texto estirado). Útil para comandas de cocina. */
  tall(on: boolean) {
    return this.size(1, on ? 2 : 1);
  }

  /**
   * Tamaño de letra: multiplicador de ancho y alto (1 o 2). `size(2, 2)`
   * agranda proporcionalmente, pero caben la mitad de columnas.
   */
  size(width: 1 | 2, height: 1 | 2) {
    this.data.push(GS, 0x21, ((width - 1) << 4) | (height - 1));
    return this;
  }

  /**
   * Título centrado y en negrita que se adapta a su largo: grande
   * (doble ancho y alto) si cabe en máximo `maxLargeLines` renglones de media
   * columna; si no, tamaño normal en varios renglones. Nunca se corta.
   */
  title(text: string, { maxLargeLines = 2 } = {}) {
    const clean = text.trim();
    if (!clean) return this;
    const large = wrapText(clean, Math.floor(PAPER_COLUMNS / 2));
    const fitsLarge =
      large.length <= maxLargeLines &&
      clean.split(/\s+/).every((w) => w.length <= PAPER_COLUMNS / 2);
    this.align("center").bold(true);
    if (fitsLarge) {
      this.size(2, 2);
      large.forEach((line) => this.line(line));
    } else {
      this.size(1, 1);
      wrapText(clean, PAPER_COLUMNS).forEach((line) => this.line(line));
    }
    return this.size(1, 1).bold(false);
  }

  /**
   * Renglón "texto ..... valor". Con `large` usa doble ancho y alto si cabe
   * en media columna; si no, cae a tamaño normal en negrita.
   */
  amountRow(left: string, right: string, { large = false } = {}) {
    const half = Math.floor(PAPER_COLUMNS / 2);
    if (large && left.length + right.length + 1 <= half) {
      this.bold(true)
        .size(2, 2)
        .line(twoColumns(left, right, half));
      return this.size(1, 1).bold(false);
    }
    if (large) this.bold(true);
    this.line(twoColumns(left, right));
    return this.bold(false);
  }

  line(text = "") {
    this.data.push(...encode(text), LF);
    return this;
  }

  separator(char = "-") {
    return this.line(char.repeat(PAPER_COLUMNS));
  }

  feed(lines: number) {
    this.data.push(ESC, 0x64, lines);
    return this;
  }

  build(): Uint8Array {
    return Uint8Array.from(this.data);
  }
}
