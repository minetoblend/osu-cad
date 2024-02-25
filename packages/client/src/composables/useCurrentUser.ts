import { UserInfo } from '@osucad/common';
import axios from 'axios';

export const useCurrentUser = createGlobalState(() => {
  const { state: user, isLoading } = useAsyncState(async () => {
    const response = await axios.get<UserInfo>('/api/users/me');
    return response.data;
  }, null);

  const isAdmin = computed(() => user.value?.isAdmin ?? false);

  return { user, isLoading, isAdmin };
});
