export const enum Invalidation {
  Transform = 1 << 0,
  DrawSize = 1 << 1 | Transform,
  Geometry = 1 << 2,
  Layout = 1 << 3,

  None = 0,
  All = Transform | DrawSize,
}

export const enum InvalidationSource {
  Self = 1,
  Parent = 2,
  Child = 4,

  Default = Self,
}