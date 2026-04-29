import { getStatsCardData } from "../services/overview.service.js";

export const getStatsCard = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const { data } = await getStatsCardData({ startDate, endDate });

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};
