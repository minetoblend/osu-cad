import type { UpdateHandler } from './UpdateHandler';

export interface ICrdt<TMutation = never> {
  id: string;

  handle(mutation: TMutation): TMutation | null | void;

  attach(updateHandler: UpdateHandler): void;

  detach(): void;
}
