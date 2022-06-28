export interface AuthData {
    username: string
    password: string
}

export interface CreateLink {
    url: string
}

type ClientMessage = AuthData | CreateLink

export default ClientMessage