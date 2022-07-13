import React, { useState, useEffect } from "react"
import ServerMessage, { CountryClickDist, intoResultAsync } from "@/bindings/server"
import { VictoryTheme, VictoryPie } from "victory"
import { isMatching, P } from "ts-pattern"
import ky from "ky"
import { useSnapshot } from "valtio"
import { jwt } from "@/states"
import { Card, CardContent, CardHeader, CardMedia, Stack } from "@mui/material"

interface PieProps {
    linkId: number
}

const apiPath = import.meta.env.VITE_SERVER_URL + "/link/dist/"

const Pie : React.FC<PieProps> = ({linkId}) => {
    const [distState, setDistState] = useState<CountryClickDist | null>(null)
    const jwtState = useSnapshot(jwt)

    // parses the CountryClickDist into the type that VictoryCharts expect
    const distIntoChartData = () => {
        if (distState == null) return []
        return distState.dist.map(({country, count}) => {
            return {x: country, y: count}
        })
    }

    useEffect(() => {
        if (jwtState.token == null) return
        // fetching from the api is unsafe cause it might throw an error
        async function unsafeFetchDist() {
            return await ky.get(apiPath + linkId, {headers: {Authorization: jwtState.token as string}}).json<ServerMessage>()
        }

        async function fetchDist () {
            let distResult = await intoResultAsync(unsafeFetchDist)
            // means we haven't recieved an expected result
            if (!distResult.ok || !isMatching({dist: P.array({country: P.string})}, distResult.value)) return
            setDistState(distResult.value)
        }

        fetchDist()
    }, [])

    const chartData = distIntoChartData()

    return (
        <Card variant="outlined">
            <CardHeader title="Click Distribution By Country"/>
            {chartData.length == 0 ? 
            <CardContent><Stack alignItems="center" justifyContent="center">Not enough data</Stack></CardContent> : 
            <CardMedia><VictoryPie data={chartData} theme={VictoryTheme.material} colorScale="qualitative"/></CardMedia>
            }
        </Card>
    )
}

export default Pie