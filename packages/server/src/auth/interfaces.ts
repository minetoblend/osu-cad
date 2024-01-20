export interface ITokenInformation {
  token_type: string;
  expires_in: number;
  access_token: string;
  refresh_token: string;
}

export interface IOsuProfileInformation {
  avatar_url: string;
  id: number;
  username: string;
}
