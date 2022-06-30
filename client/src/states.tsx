import { CreatedLink } from "@/bindings/server"
import { proxy } from "valtio"
import { proxyMap } from "valtio/utils"

export const jwt = proxy<{token: string | null}>({token: null})
export const links = proxyMap<number, string>([]) // where the number is the id and the string is the url