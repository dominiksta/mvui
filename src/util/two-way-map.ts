export default class TwoWayMap<T1, T2> {
  private from1To2 = new Map<T1, T2>();
  private from2To1 = new Map<T2, T1>();

  public set(key: T1, value: T2) {
    this.from1To2.set(key, value);
    this.from2To1.set(value, key);
  }

  public get(key: T1) {
    return this.from1To2.get(key);
  }

  public getReverse(key: T2) {
    return this.from2To1.get(key);
  }
}
