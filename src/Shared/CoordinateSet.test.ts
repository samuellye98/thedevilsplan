import CoordinateSet from './CoordinateSet';

describe('CoordinateSet', () => {
  it('Can add a coordinate', () => {
    const cs = new CoordinateSet();
    expect(cs.has(1, 1)).toBeFalsy();
    cs.add(1, 1);
    expect(cs.has(1, 1)).toBeTruthy();
  });

  it('Can remove a coordinate', () => {
    const cs = new CoordinateSet();
    cs.add(1, 1);
    expect(cs.has(1, 1)).toBeTruthy();
    cs.remove(1, 1);
    expect(cs.has(1, 1)).toBeFalsy();
  });
});
