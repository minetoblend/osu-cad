export interface ISerializer<TValue, TPlain> {
  serialize(value: TValue): TPlain;

  deserialize(plain: TPlain): TValue;
}
