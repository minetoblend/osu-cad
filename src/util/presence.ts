export type Presence<Extra = {}> = {
    user: UserInfo
    extra: Extra
}

export type UserInfo = {
    id: string;
    displayName: string;
    avatarUrl: string;
}
