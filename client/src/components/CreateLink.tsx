import React, { useRef, useEffect } from "react"
import ServerMessage from "@/bindings/server"
import { useSnapshot } from "valtio"
import { jwt } from "@/states"
import ky from "ky"

const createLinkPath = import.meta.env.VITE_SERVER_URL + '/link/create'

const CreateLink : React.FC = () => {
    const form = useRef<HTMLFormElement | null>(null)
    const jwtState = useSnapshot(jwt)

    useEffect(() => {
        async function createLink (event: SubmitEvent) {
            event.preventDefault()
            if (form.current == null) return

            let data = new FormData(form.current)
            let url = data.get("url")
            if (typeof url != "string") {
                return
            }

            let res =  await ky.post(createLinkPath, {json: {url}, headers: {Authorization: jwtState.token as string}}).json<ServerMessage>()
            console.log(res)
        }

        form.current?.addEventListener('submit', createLink)
        return () => form.current?.removeEventListener('submit', createLink)
    }, [])

    return (
        <form ref={form}>
            <input type="url" name="url" placeholder="your url"/>
            <button type="submit">create link</button>
        </form>
    )
}

export default CreateLink