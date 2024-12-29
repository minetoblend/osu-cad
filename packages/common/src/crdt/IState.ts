export interface IState<TMutation> {
  mutate(command: TMutation): void;
}
