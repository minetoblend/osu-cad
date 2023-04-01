export interface IWebSocket {
  on(event: "disconnect", callback: () => void): void;

  on(event: string, callback: (...args: any[]) => void): void;

  onAny(callback: (event: string, ...args: any[]) => void): void;

  off(event: string, callback: (...args: any[]) => void): void;

  offAny(callback: (event: string, ...args: any[]) => void): void;

  emit(event: string, ...args: any[]): void;
}
