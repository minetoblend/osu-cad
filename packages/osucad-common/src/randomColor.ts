const colorList = [
  "#ed4747",
  "#20f5e7",
  "#ed8f47",
  "#208bf5",
  "#f7e928",
  "#3c20f5",
  "#a0f520",
  "#ae20f5",
  "#20f55c",
  "#f52092",
];

export function getRandomColor() {
  return colorList[Math.floor(Math.random() * colorList.length)];
}

export class ColorCycler {
  private index = 0;

  constructor(private colors: string[] = colorList) {}

  next() {
    const color = this.colors[this.index];
    this.index = (this.index + 1) % this.colors.length;
    return color;
  }
}
