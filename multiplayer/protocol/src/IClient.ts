export interface IClient
{
  clientId: string
  user: IUser
}

export interface IUser
{
  id: string | number
  username: string
}
