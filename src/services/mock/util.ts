export function delay(ms = 220): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let counter = 1000;
export function genId(prefix: string): string {
  counter += 1;
  return `${prefix}-${counter}`;
}
