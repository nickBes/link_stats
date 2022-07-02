import Auth from "@/components/Auth"
import { jwt } from "@/states"
import ky from "ky"
import React, { useEffect, useState } from "react"
import { useParams } from "react-router"
import { isMatching, P } from "ts-pattern"
import { useSnapshot } from "valtio"
import ServerMessage, { CountryClickDist } from "@/bindings/server"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from "react-chartjs-2"
import Gradient from "javascript-color-gradient"

const distPath = import.meta.env.VITE_SERVER_URL + '/link/dist/'
ChartJS.register(ArcElement, Tooltip, Legend);

const Stats : React.FC = () => {
    const gradient = new Gradient().setColorGradient( "#CC95C0", "#DBD4B4")
    const params = useParams()
    const jwtState = useSnapshot(jwt)
    const [distState, setDistState] = useState<CountryClickDist | null>(null)


    useEffect(() => {
        async function getData() {
            let distData = await ky.get(distPath + params.id, {headers: {Authorization: jwtState.token as string}}).json<ServerMessage>()
            if (!isMatching({countries: P.array(P.string)}, distData)) return
            setDistState(distData)
            gradient.setMidpoint(distData.countries.length)
            console.log(gradient.getColors())
        }
        getData()
    }, [])
    return (
        <Auth>
            <>
                {distState != null && <Pie data={{labels: distState.countries, datasets: [{data: distState.clickDist, backgroundColor: gradient.getColors(), borderWidth: 0}]}}/>}
            </>
        </Auth>
    )
}

export default Stats