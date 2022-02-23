import { ref } from "vue";
import { Router } from "vue-router";
import { httpClient } from "@/common-http";

export const currentUser = ref()

export function setupUserStore(router: Router) {
    router.beforeEach(async (to) => {
        console.log(to.name)
        if (to.name !== 'Unauthorized') {
            localStorage.setItem('redirectAfterAuthorize', to.fullPath)
            try {
                const user = (await httpClient.get('/user/me')).data
                if (!user)
                    return '/unauthorized'
                currentUser.value = user
            } catch (e) {
                console.log(e)
                return '/unauthorized'
            }
        }
    })
}
