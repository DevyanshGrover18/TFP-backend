import { getStatsCardData } from "../services/overview.service.js"

export const getStatsCard = async (req, res, next) =>{
    const {data} = await getStatsCardData();

    res.status(200).json({
        success : true,
        data
    })
}