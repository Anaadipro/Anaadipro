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

        const weekStart = moment().startOf("isoWeek").toDate();
        const weekEnd = moment().endOf("isoWeek").toDate();

        const baseFilter = { dscode, status: true };
        if (dateFrom || dateTo) {
            baseFilter.createdAt = {};
            if (dateFrom) baseFilter.createdAt.$gte = new Date(dateFrom);
            if (dateTo) {
                const endDate = new Date(dateTo);
                endDate.setHours(23, 59, 59, 999);
                baseFilter.createdAt.$lte = endDate;
            }
        }

        // Fetch the oldest order ID once
        const oldestOrder = await OrderModel.findOne({ dscode }).sort({ createdAt: 1 }).select("_id").lean();
        if (oldestOrder) {
            baseFilter._id = { $ne: oldestOrder._id };
        }

        // Flatten team fetching
        const allUsers = await UserModel.find({}).select("dscode pdscode").lean();
        const userMap = new Map();
        allUsers.forEach(user => {
            if (!userMap.has(user.pdscode)) userMap.set(user.pdscode, []);
            userMap.get(user.pdscode).push(user.dscode);
        });

        function collectTeamCodes(code, collected = new Set()) {
            if (!collected.has(code)) {
                collected.add(code);
                const children = userMap.get(code) || [];
                children.forEach(child => collectTeamCodes(child, collected));
            }
            return collected;
        }

        const teamDSCodes = Array.from(collectTeamCodes(dscode));
        const teamFilter = {
            dscode: { $in: teamDSCodes },
            status: true,
            ...(oldestOrder && { _id: { $ne: oldestOrder._id } }),
        };

        // Aggregations
        const [individual, team] = await Promise.all([
            OrderModel.aggregate([
                { $match: baseFilter },
                {
                    $facet: {
                        total: [
                            {
                                $group: {
                                    _id: null,
                                    totalOrders: { $sum: 1 },
                                    totalsp: { $sum: { $toDouble: "$totalsp" } }
                                }
                            }
                        ],
                        currentWeek: [
                            {
                                $match: {
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
                        ]
                    }
                }
            ]),
            OrderModel.aggregate([
                { $match: teamFilter },
                {
                    $facet: {
                        total: [
                            {
                                $group: {
                                    _id: null,
                                    totalOrders: { $sum: 1 },
                                    totalsp: { $sum: { $toDouble: "$totalsp" } }
                                }
                            }
                        ],
                        currentWeek: [
                            {
                                $match: {
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
                        ]
                    }
                }
            ])
        ]);

        const indTotal = individual[0]?.total[0] || {};
        const indWeek = individual[0]?.currentWeek[0] || {};
        const teamTotal = team[0]?.total[0] || {};
        const teamWeek = team[0]?.currentWeek[0] || {};

        return Response.json(
            {
                success: true,
                totalOrders: indTotal.totalOrders || 0,
                totalsp: indTotal.totalsp || 0,
                currentWeekOrders: indWeek.currentWeekOrders || 0,
                currentWeekTotal: indWeek.currentWeekTotal || 0,

                teamTotalOrders: teamTotal.totalOrders || 0,
                teamTotalsp: teamTotal.totalsp || 0,
                teamCurrentWeekOrders: teamWeek.currentWeekOrders || 0,
                teamCurrentWeekTotal: teamWeek.currentWeekTotal || 0
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching data:", error);
        return Response.json({ message: "Error fetching data!", success: false }, { status: 500 });
    }
}
