export class StageDefinition {
  constructor(readonly columns: number) {
    console.assert(columns >= 1, 'Column count must be above zero');
  }

  isSpecialColumn(column: number): boolean {
    return this.columns % 2 === 1 && column === Math.floor(this.columns) / 2;
  }
}
