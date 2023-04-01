import { User } from '../users/user.entity';

export interface IEditorSessionToken {
  beatmapId: string;
  user: User;
}
