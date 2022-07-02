import { proxy } from "valtio"
import { proxyMap } from "valtio/utils"
import Cookies from "js-cookie"

let cookieJwt = Cookies.get('jwt')

export const jwt = proxy<{token: string | null}>({token: cookieJwt ?? null})
export const links = proxyMap<number, string>([]) // where the number is the id and the string is the url