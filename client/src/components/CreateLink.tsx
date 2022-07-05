import React, { useRef, useEffect, useState } from "react"
import ServerMessage from "@/bindings/server"
import { useSnapshot } from "valtio"
import { isMatching, P } from "ts-pattern"
import { jwt, links } from "@/states"
import ky from "ky"
import { FormControl, IconButton, InputAdornment, InputLabel, Stack, TextField, OutlinedInput, CircularProgress } from "@mui/material"
import { AddBox } from "@mui/icons-material"

const createLinkPath = import.meta.env.VITE_SERVER_URL + '/link/'

const CreateLink : React.FC = () => {
    const form = useRef<HTMLFormElement | null>(null)
    const jwtState = useSnapshot(jwt)
    const [isLoading, setLoading] = useState(false)

    useEffect(() => {
        async function createLink (event: SubmitEvent) {
            event.preventDefault()
            if (form.current == null) return

            let data = new FormData(form.current)
            let url = data.get("url")
            if (typeof url != "string" || url == "") return

            setLoading(true)
            let res = await ky.post(createLinkPath, {json: {url}, headers: {Authorization: jwtState.token as string}}).json<ServerMessage>()
            setLoading(false)

            if (!isMatching({url: P.string}, res)) return

            links.set(res.id, res.url)
        }

        form.current?.addEventListener('submit', createLink)
        return () => form.current?.removeEventListener('submit', createLink)
    }, [])

    return (
        <Stack m={2} alignItems="center" direction="row" justifyContent="center">
            <form ref={form}>
                <Stack direction="row">
                    <FormControl>
                        <InputLabel htmlFor="link-url">URL</InputLabel>
                        <OutlinedInput required size="medium" name="url" id="link-url" endAdornment={
                            <InputAdornment position="end">
                                {isLoading ? <CircularProgress size="1.5rem"/> : <IconButton type="submit"><AddBox/></IconButton>}
                            </InputAdornment>
                        }/>
                    </FormControl>
                </Stack>
            </form>
        </Stack>


    )
}

export default CreateLink