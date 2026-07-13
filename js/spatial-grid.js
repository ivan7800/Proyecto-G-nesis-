const KEY_OFFSET = 512;
const KEY_SPAN = 4096;

export class SpatialGrid {
  constructor(cellSize = 100) { this.cellSize = cellSize; this.cells = new Map(); }
  clear() { this.cells.clear(); }
  key(x, y) { return (Math.floor(x / this.cellSize) + KEY_OFFSET) * KEY_SPAN + Math.floor(y / this.cellSize) + KEY_OFFSET; }
  insert(entity) {
    const key = this.key(entity.x, entity.y);
    let cell = this.cells.get(key);
    if (!cell) { cell = []; this.cells.set(key, cell); }
    cell.push(entity);
  }
  query(x, y, radius) {
    const out = [];
    const minX = Math.floor((x - radius) / this.cellSize) + KEY_OFFSET;
    const maxX = Math.floor((x + radius) / this.cellSize) + KEY_OFFSET;
    const minY = Math.floor((y - radius) / this.cellSize) + KEY_OFFSET;
    const maxY = Math.floor((y + radius) / this.cellSize) + KEY_OFFSET;
    for (let gx = minX; gx <= maxX; gx++) {
      const base = gx * KEY_SPAN;
      for (let gy = minY; gy <= maxY; gy++) {
        const cell = this.cells.get(base + gy);
        if (cell) for (let i = 0; i < cell.length; i++) out.push(cell[i]);
      }
    }
    return out;
  }
}
