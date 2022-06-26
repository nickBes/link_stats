import { proxy } from "valtio"

export const jwt = proxy<{token: string | null}>({token: null})