export function apiPort() {
    return 3000
}

export function apiProtocol() {
    return 'http'
}

export function apiUrl(path: string) {
    if (path.startsWith('/'))
        path = path.substring(1)
    return `${apiProtocol()}://${window.location.hostname}:${apiPort()}/${path}`
}

export function nakamaHostname() {
    return window.location.hostname
}

export function nakamaPort() {
    return 7350
}
