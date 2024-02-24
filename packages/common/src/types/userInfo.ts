export interface UserInfo {
  id: number;
  username: string;
  avatarUrl: string | null;
  links: {
    self: {
      href: string;
    };
    profile: {
      href: string;
    };
  };
}
