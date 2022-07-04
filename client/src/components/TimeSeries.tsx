import React, { useEffect, useState, ChangeEvent } from "react"
import { VictoryChart, VictoryBar, VictoryTheme } from "victory"
import ServerMessage, { intoResultAsync, ResultValue, intoResult } from "@/bindings/server"
import {isMatching, P} from "ts-pattern"
import { useSnapshot } from "valtio"
import { jwt } from "@/states"
import ky from "ky"

interface TimeSeriesProps {
    linkId: number
}

const apiPath = import.meta.env.VITE_SERVER_URL + "/link/series/"

const TimeSeries : React.FC<TimeSeriesProps> = ({linkId}) => {
    type TimeUnit = "minute" | "hour" | "day"

    const TimeOptions : {[option: string]: TimeUnit} = {
        Hour: "minute",
        Day: "hour",
        Month: "day"
    }

    const jwtState = useSnapshot(jwt)
    const [dateState, setDateState] = useState<Date[] | null>(null)
    const [timeUnit, setTimeUnit] = useState<TimeUnit>("minute")

    const handleTimeUnitChange = (e: ChangeEvent<HTMLSelectElement>) => {
        let val = e.currentTarget.value
        let unit = TimeOptions[val]
        if (unit != undefined) {
            setTimeUnit(unit)
        }
    }

    const createDateSeries = () => {
        let now = new Date(Date.now())
        let filteredDates = dateState?.filter(date => date.getFullYear() == now.getFullYear() || date.getMonth() == now.getMonth())
        let dateGroup = new Date(now.getFullYear(), now.getMonth())
        let dateMap: Map<Date, number> = new Map()

        if (isMatching("minute", timeUnit)) {
            filteredDates = filteredDates?.filter(date => date.getHours() == now.getHours() || date.getDate() == now.getDate())
            filteredDates?.forEach(date => {

                dateGroup.setDate(date.getDate())
                dateGroup.setHours(date.getHours())
                dateGroup.setMinutes(date.getMinutes())

                let count = dateMap.get(dateGroup) ?? 0
                dateMap.set(dateGroup, count + 1)
            })
        } else if (isMatching("hour", timeUnit)) {
            filteredDates = filteredDates?.filter(date => date.getDate() == now.getDate())
            filteredDates?.forEach(date => {
                dateGroup.setDate(date.getDate())
                dateGroup.setHours(date.getHours())

                let count = dateMap.get(dateGroup) ?? 0
                dateMap.set(dateGroup, count + 1)
            })
        } else if (isMatching("day", timeUnit)) {
            filteredDates?.forEach(date => {
                dateGroup.setDate(date.getDate())

                let count = dateMap.get(dateGroup) ?? 0
                dateMap.set(dateGroup, count + 1)
            })
        }

        console.log(dateMap)

        return Array.from(dateMap).map(([date, count]) => {
            return {
                x: date.getTime(),
                y: count
            }
        })
    }

    useEffect(() => {
        if (jwtState.token == null) return

        async function unsafeFetchSeries() {
            return await ky.get(apiPath + linkId, {headers: {Authorization: jwtState.token as string}}).json<ServerMessage>()            
        }

        async function fetchSeries() {
            let seriesResult = await intoResultAsync(unsafeFetchSeries)
            if (!seriesResult.ok || !isMatching({series: P.array(P.string)}, seriesResult.value)) return

            let dates = seriesResult.value.series.map(date => intoResult(() => new Date(date)))
                                                .filter((res): res is ResultValue<Date> => res.ok)
                                                .map(res => res.value)

            setDateState(dates)
        }

        fetchSeries()
    }, [])

    return (
        <>
            <select onChange={handleTimeUnitChange}>
                {Object.keys(TimeOptions).map(option => <option key={option} value={option}>Last {option}</option>)}
            </select>
            <VictoryChart scale={{x: "time", y: "linear"}} theme={VictoryTheme.material}>
                <VictoryBar barRatio={1} data={createDateSeries()}/>
            </VictoryChart>
        </>
    )
}

export default TimeSeries