export interface AuthData {
    username: string
    password: string
}

export interface CreateLink {
    url: string
}

export interface DeleteLink {
    linkId: number
}

type ClientMessage = AuthData | CreateLink | DeleteLink

export default ClientMessage