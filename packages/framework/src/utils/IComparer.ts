export interface IComparer<T> 
{
  compare: (a: T, b: T) => number;
}
