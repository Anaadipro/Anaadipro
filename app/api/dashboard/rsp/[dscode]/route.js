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

        // Fetch all self orders
        const selfOrders = await OrderModel.find({ dscode, status: true }).lean();

        // Build team hierarchy
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
        const teamOrders = await OrderModel.find({ dscode: { $in: teamDSCodes }, status: true }).lean();

        // === CALCULATIONS ===

        // Total & Weekly self
        const selfTotalOrders = selfOrders.length;
        const selfTotalsp = selfOrders.reduce((sum, o) => sum + parseFloat(o.totalsp), 0);
        const selfWeekOrders = selfOrders.filter(o =>
            moment(o.createdAt).isBetween(weekStart, weekEnd, null, "[]")
        );
        const selfCurrentWeekOrders = selfWeekOrders.length;
        const selfCurrentWeekTotal = selfWeekOrders.reduce((sum, o) => sum + parseFloat(o.totalsp), 0);

        // SAOSP & SGOSP of self for current week
        const selfweeksaosp = selfWeekOrders
            .filter(o => o.salegroup === "SAO")
            .reduce((sum, o) => sum + parseFloat(o.totalsp), 0);
        const selfweeksgosp = selfWeekOrders
            .filter(o => o.salegroup === "SGO")
            .reduce((sum, o) => sum + parseFloat(o.totalsp), 0);

        // RSP Helper (remove lowest orderNo)
        function getRSP(orders) {
            if (orders.length <= 1) return 0;
            const minOrderNo = Math.min(...orders.map(o => parseInt(o.orderNo || "0")));
            return orders
                .filter(o => parseInt(o.orderNo || "0") !== minOrderNo)
                .reduce((sum, o) => sum + parseFloat(o.totalsp), 0);
        }

        function getTeamRSP(orders, weekOnly = false) {
            const userMap = new Map();
            for (const order of orders) {
                if (weekOnly && !moment(order.createdAt).isBetween(weekStart, weekEnd, null, "[]")) continue;

                if (!userMap.has(order.dscode)) userMap.set(order.dscode, []);
                userMap.get(order.dscode).push(order);
            }

            let total = 0;
            for (const orders of userMap.values()) {
                if (orders.length <= 1) continue;
                const minOrderNo = Math.min(...orders.map(o => parseInt(o.orderNo || "0")));
                total += orders
                    .filter(o => parseInt(o.orderNo || "0") !== minOrderNo)
                    .reduce((sum, o) => sum + parseFloat(o.totalsp), 0);
            }
            return total;
        }

        const selfRSPAll = getRSP(selfOrders);
        const selfRSPWeek = getRSP(selfWeekOrders);

        const teamRSPAll = getTeamRSP(teamOrders);
        const teamRSPWeek = getTeamRSP(teamOrders, true);

        // Team Total & Weekly
        const teamTotalOrders = teamOrders.length;
        const teamTotalsp = teamOrders.reduce((sum, o) => sum + parseFloat(o.totalsp), 0);
        const teamWeekOrders = teamOrders.filter(o =>
            moment(o.createdAt).isBetween(weekStart, weekEnd, null, "[]")
        );
        const teamCurrentWeekOrders = teamWeekOrders.length;
        const teamCurrentWeekTotal = teamWeekOrders.reduce((sum, o) => sum + parseFloat(o.totalsp), 0);

        return Response.json({
            success: true,

            // Self stats
            totalOrders: selfTotalOrders,
            totalsp: selfTotalsp,
            currentWeekOrders: selfCurrentWeekOrders,
            currentWeekTotal: selfCurrentWeekTotal,
            selfweeksaosp,
            selfweeksgosp,
            selfRSPAll,
            selfRSPWeek,

            // Team stats
            teamTotalOrders,
            teamTotalsp,
            teamCurrentWeekOrders,
            teamCurrentWeekTotal,
            teamRSPAll,
            teamRSPWeek
        });
    } catch (error) {
        console.error("Error fetching data:", error);
        return Response.json({ message: "Error fetching data!", success: false }, { status: 500 });
    }
}
