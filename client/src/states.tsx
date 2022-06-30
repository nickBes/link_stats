import { CreatedLink } from "@/bindings/server"
import { proxy } from "valtio"
import { proxySet } from "valtio/utils"

export const jwt = proxy<{token: string | null}>({token: null})
export const links = proxySet<CreatedLink>([])