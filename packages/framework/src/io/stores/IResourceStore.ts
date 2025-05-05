import type { IDisposable } from "../../types";

export interface IResourceStore<T> extends IDisposable 
{
  has(name: string): boolean;

  get(name: string): T | null;

  getAsync(name: string): Promise<T | null>;

  getAvailableResources(): string[];

  canLoad(name: string): boolean;
}
