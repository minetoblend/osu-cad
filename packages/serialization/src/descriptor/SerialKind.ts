export interface SerialKind {
}

export abstract class PrimitiveKind implements SerialKind {
  static readonly Boolean = new class extends PrimitiveKind {
  }();

  static readonly Uint8 = new class extends PrimitiveKind {
  }();

  static readonly Uint16 = new class extends PrimitiveKind {
  }();

  static readonly Uint32 = new class extends PrimitiveKind {
  }();

  static readonly Int8 = new class extends PrimitiveKind {
  }();

  static readonly Int16 = new class extends PrimitiveKind {
  }();

  static readonly Int32 = new class extends PrimitiveKind {
  }();

  static readonly Float32 = new class extends PrimitiveKind {
  }();

  static readonly Float64 = new class extends PrimitiveKind {
  }();

  static readonly String = new class extends PrimitiveKind {
  }();
}

export abstract class StructureKind implements SerialKind {
  static readonly CLASS = new class extends StructureKind {
  }();

  static readonly LIST = new class extends StructureKind {
  }();

  static readonly MAP = new class extends StructureKind {
  }();
}

// TODO: PolymorphicKind
