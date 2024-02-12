import {UserInfo} from "@osucad/common";
import axios from "axios";


export function useCurrentUser() {

  const {state: user} = useAsyncState(async () => {
    const response = await axios.get<UserInfo>('/api/users/me')
    return response.data
  }, null)

  return {user}
}