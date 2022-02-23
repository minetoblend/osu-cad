import {ref} from "vue";
import {Router} from "vue-router";
import {httpClient} from "@/common-http";

export const currentUser = ref()

export function setupUserStore(router: Router) {
    router.beforeEach(async (to, from, next) => {
        if (to.name !== 'Unauthorized')
            try {
                const user = (await httpClient.get('/user/me')).data
                if (!user)
                    return next('/unauthorized')
            } catch (e) {
                return next('/unauthorized')
            }
        next()
    })
}
