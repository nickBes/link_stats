import Auth from "@/components/Auth"
import { jwt } from "@/states"
import ky from "ky"
import React, { ChangeEvent, useEffect, useState } from "react"
import { useParams } from "react-router"
import { isMatching, P } from "ts-pattern"
import { useSnapshot } from "valtio"
import ServerMessage, { ClickTimeSeries, CountryClickDist, intoResult, Result, ResultValue } from "@/bindings/server"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Line, Pie } from "react-chartjs-2"
import Gradient from "javascript-color-gradient"

const statsPath = import.meta.env.VITE_SERVER_URL + '/link/'
ChartJS.register(ArcElement, Tooltip, Legend);

const Stats : React.FC = () => {
    // unit map for drawing graph
    enum TimeUnit {
        Hour="minutes",
        Day="hour",
        Week="day"
    }

    const timeUnitArray = Object.entries(TimeUnit)

    const gradient = new Gradient().setColorGradient( "#5C9EAD", "#EEEEEE", "#E39774")
    const params = useParams()
    const jwtState = useSnapshot(jwt)
    const [distState, setDistState] = useState<CountryClickDist | null>(null)
    const [colors, setColors] = useState(gradient.getColors())
    const [dateState, setDateState] = useState<Date[] | null>(null)
    const [timeUnit, setTimeUnit] = useState<TimeUnit>(TimeUnit.Hour)

    const handleTimeUnitChange = (e: ChangeEvent<HTMLSelectElement>) => {
        let val = e.currentTarget.value
        console.log(val)
    }

    useEffect(() => {
        async function getData() {
            let distData = await ky.get(statsPath + "dist/" + params.id, {headers: {Authorization: jwtState.token as string}}).json<ServerMessage>()
            if (!isMatching({countries: P.array(P.string)}, distData)) return
            setDistState(distData)
            gradient.setMidpoint(distData.countries.length)
            setColors(gradient.getColors())

            let seriesData = await ky.get(statsPath + "series/" + params.id, {headers: {Authorization: jwtState.token as string}}).json<ServerMessage>()
            if (!isMatching({series: P.array(P.string)}, seriesData)) return
            let dates = seriesData.series.map(date => intoResult(() => new Date(date)))
                                                .filter<ResultValue<Date>>((res) : res is ResultValue<Date> => res.ok)
                                                .map(res => res.value)
            setDateState(dates)
        }
        getData()
    }, [])

    return (
        <Auth>
            <>
                {distState != null && <Pie data={{labels: distState.countries, datasets: [{data: distState.clickDist, backgroundColor: colors, borderWidth: 0}]}}/>}
                <select onChange={handleTimeUnitChange}>
                    {timeUnitArray.map(([unit, value]) => <option key={unit} value={value}>Last {unit}</option>)}
                </select>
                {/* {dateState != null && <Line options={{scales: {x: {time: {unit: timeUnit}}}}}/>} */}
            </>
        </Auth>
    )
}

export default Stats