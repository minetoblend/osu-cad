import { UserInfo } from '@osucad/common';
import axios from 'axios';

export const useCurrentUser = createGlobalState(() => {
  const element: HTMLElement | null = document.getElementById('user-json');

  if (element) {
    const user = JSON.parse(element.textContent ?? 'null') as UserInfo;

    return {
      user: ref(user),
      isLoading: ref(false),
      isAdmin: computed(() => user.isAdmin),
    };
  }

  const { state: user, isLoading } = useAsyncState(async () => {
    const response = await axios.get<UserInfo>('/api/users/me');
    return response.data;
  }, null);

  const isAdmin = computed(() => user.value?.isAdmin ?? false);

  return { user, isLoading, isAdmin };
});
