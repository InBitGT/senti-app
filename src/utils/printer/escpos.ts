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

export function wrapText(text: string, width: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= width) {
      current = next;
      return;
    }
    if (current) lines.push(current);
    current = word.slice(0, width);
  });
  if (current) lines.push(current);
  return lines;
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

  tall(on: boolean) {
    this.data.push(GS, 0x21, on ? 0x01 : 0x00);
    return this;
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
