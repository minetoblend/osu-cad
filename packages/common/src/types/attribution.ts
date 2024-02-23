import { UserId } from '../protocol';

export interface Attribution {
  creator: UserId;
  lastModifiedBy: UserId;
  createdAt: number;
  updatedAt: number;
}

export interface IHasAttribution {
  attribution?: Attribution;
}
