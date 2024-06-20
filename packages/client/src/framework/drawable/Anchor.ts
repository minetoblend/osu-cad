export const enum Anchor {
  y0 = 1 << 0,
  y1 = 1 << 1,
  y2 = 1 << 2,
  x0 = 1 << 3,
  x1 = 1 << 4,
  x2 = 1 << 5,
  Custom = 1 << 6,

  TopLeft = y0 | x0,
  TopCentre = y0 | x1,
  TopRight = y0 | x2,

  CentreLeft = y1 | x0,
  Centre = y1 | x1,
  CentreRight = y1 | x2,

  BottomLeft = y2 | x0,
  BottomCentre = y2 | x1,
  BottomRight = y2 | x2,
}
