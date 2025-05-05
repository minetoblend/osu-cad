export interface ILerp<T> 
{
  lerp: (target: T, t: number) => T;
}
