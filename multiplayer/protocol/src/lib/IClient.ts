export interface IClient
{
  clientId: number
  user: IUser
}

export interface IUser
{
  id: string | number
  username: string
}
