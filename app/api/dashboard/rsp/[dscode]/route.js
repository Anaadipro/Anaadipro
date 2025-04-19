import dbConnect from "@/lib/dbConnect";
import OrderModel from "@/model/Order";
import UserModel from "@/model/User";
import moment from "moment";

export async function GET(request, { params }) {
    await dbConnect();

    try {
        const dscode = decodeURIComponent(params?.dscode || "");
        const url = new URL(request.url);
        const dateFrom = url.searchParams.get("dateFrom");
        const dateTo = url.searchParams.get("dateTo");

        let filter = { dscode, status: true };

        if (dateFrom || dateTo) {
            filter.createdAt = {};
            if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
            if (dateTo) {
                const endDate = new Date(dateTo);
                endDate.setHours(23, 59, 59, 999);
                filter.createdAt.$lte = endDate;
            }
        }

        // Fetch the oldest order to exclude
        // Fetch the oldest order for this specific dscode
        const oldestOrder = await OrderModel.findOne({ dscode })
            .sort({ createdAt: 1 })
            .select("_id")
            .lean();

        if (oldestOrder) {
            filter._id = { $ne: oldestOrder._id };
        }


        // Get current week's start (Monday) and end (Sunday)
        const weekStart = moment().startOf("isoWeek").toDate();
        const weekEnd = moment().endOf("isoWeek").toDate();

        // Fetch total data for individual user
        const [totalData, currentWeekData] = await Promise.all([
            OrderModel.aggregate([
                { $match: filter },
                {
                    $group: {
                        _id: null,
                        totalOrders: { $sum: 1 },
                        totalsp: { $sum: { $toDouble: "$totalsp" } }
                    }
                }
            ]),
            OrderModel.aggregate([
                {
                    $match: {
                        ...filter,
                        createdAt: { $gte: weekStart, $lte: weekEnd }
                    }
                },
                {
                    $group: {
                        _id: null,
                        currentWeekOrders: { $sum: 1 },
                        currentWeekTotal: { $sum: { $toDouble: "$totalsp" } }
                    }
                }
            ])
        ]);

        // **Fetch Team Data (Including Self)**
        async function getTeamDSCodes(parentDscode) {
            const team = await UserModel.find({ pdscode: parentDscode }).select("dscode").lean();
            let teamDSCodes = team.map(user => user.dscode);
            for (let user of team) {
                const subTeam = await getTeamDSCodes(user.dscode);
                teamDSCodes = [...teamDSCodes, ...subTeam];
            }
            return teamDSCodes;
        }

        let teamDSCodes = await getTeamDSCodes(dscode);
        teamDSCodes.push(dscode); // Include self in team

        const teamFilter = { dscode: { $in: teamDSCodes }, status: true };

        if (oldestOrder) {
            teamFilter._id = { $ne: oldestOrder._id };
        }

        const [teamTotalData, teamCurrentWeekData] = await Promise.all([
            OrderModel.aggregate([
                { $match: teamFilter },
                {
                    $group: {
                        _id: null,
                        totalOrders: { $sum: 1 },
                        totalsp: { $sum: { $toDouble: "$totalsp" } }
                    }
                }
            ]),
            OrderModel.aggregate([
                {
                    $match: {
                        ...teamFilter,
                        createdAt: { $gte: weekStart, $lte: weekEnd }
                    }
                },
                {
                    $group: {
                        _id: null,
                        currentWeekOrders: { $sum: 1 },
                        currentWeekTotal: { $sum: { $toDouble: "$totalsp" } }
                    }
                }
            ])
        ]);

        return Response.json(
            {
                success: true,
                totalOrders: totalData[0]?.totalOrders || 0,
                totalsp: totalData[0]?.totalsp || 0,
                currentWeekOrders: currentWeekData[0]?.currentWeekOrders || 0,
                currentWeekTotal: currentWeekData[0]?.currentWeekTotal || 0,

                teamTotalOrders: teamTotalData[0]?.totalOrders || 0,
                teamTotalsp: teamTotalData[0]?.totalsp || 0,
                teamCurrentWeekOrders: teamCurrentWeekData[0]?.currentWeekOrders || 0,
                teamCurrentWeekTotal: teamCurrentWeekData[0]?.currentWeekTotal || 0
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching data:", error);
        return Response.json(
            { message: "Error fetching data!", success: false },
            { status: 500 }
        );
    }
}
