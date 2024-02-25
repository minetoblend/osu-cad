export interface UserInfo {
  id: number;
  username: string;
  avatarUrl: string | null;
  isAdmin: boolean;
  created: string;
  links: {
    self: {
      href: string;
    };
    profile: {
      href: string;
    };
  };
}
