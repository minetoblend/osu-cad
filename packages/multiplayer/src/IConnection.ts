import type { OpCode } from "./OpCode";

export interface IConnection
{
  readonly clientId: number

  send(opcode: OpCode, data: ArrayBuffer): void
}
