import BeforeHookFunction = nkruntime.BeforeHookFunction;
import AuthenticateCustomRequest = nkruntime.AuthenticateCustomRequest;
import Codes = nkruntime.Codes;

const errNoToken: nkruntime.Error = {
    message: 'No Token',
    code: Codes.INVALID_ARGUMENT
}

const errInvalidToken: nkruntime.Error = {
    message: 'Invalid Token',
    code: Codes.UNAUTHENTICATED
}

export const BeforeAuthenticateOsucad: BeforeHookFunction<AuthenticateCustomRequest> =
    (ctx, logger, nk, data) => {
        const token = data.account.id

        logger.info('token: ' + token)

        if (token === '')
            throw errNoToken


        const response = nk.httpRequest('http://api:3000/user/me', 'get', {
            Authorization: `Bearer ${token}`
        })

        logger.info('response code: ' + response.code)

        logger.info('response: ' + response.body)

        if (response.code < 300) {
            const userData = JSON.parse(response.body) as any

            data.account.id = `${userData.user.profileId}`
            data.username = userData.user.displayName
            data.create = true

            logger.info('successfully logged in as ' + userData.displayName)
        } else {
            throw errInvalidToken
        }

        return data
    }