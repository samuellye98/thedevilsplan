export class CoordinateSet {
  set: Record<number, Record<number, boolean>> = {};

  add(x: number, y: number) {
    this.set[x] ||= {};
    this.set[x][y] = true;
  }

  remove(x: number, y: number) {
    // if the coordinate doesn't exist, don't do anything
    if (!this.set[x] || !this.set[y]) {
      return;
    }

    // otherwise, delete it
    delete this.set[x][y];

    // if the branch has no leaves, delete the branch, too
    if (!Object.keys(this.set[x]).length) {
      delete this.set[x];
    }
  }

  has(x: number, y: number) {
    return !!this.set[x]?.[y];
  }
}
