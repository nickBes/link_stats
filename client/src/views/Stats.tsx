import Auth from "@/components/Auth"
import React, { useEffect, useState } from "react"
import { useParams } from "react-router"
import Pie from "@/components/Pie"
import TimeSeries from "@/components/TimeSeries"
import { Stack } from "@mui/material"

const Stats : React.FC = () => {
    const params = useParams()
    const [linkId, setLinkId] = useState<number | null>(null)

    useEffect(() => {
        if (params.id == undefined) return
        let parsedLinkId = parseInt(params.id)
        if (isNaN(parsedLinkId)) return
        setLinkId(parsedLinkId)
    }, [])

    return (
        <Auth>
            <>
                {linkId != null && <>
                    <Stack alignContent="center" alignItems="center">
                        <Stack direction={{xs: "column", md: "row"}} spacing={2}>
                            <Pie linkId={linkId}/>
                            <TimeSeries linkId={linkId}/>
                        </Stack>
                    </Stack>
                </>}
                
            </>
        </Auth>
    )
}

export default Stats