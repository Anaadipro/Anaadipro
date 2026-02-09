import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export async function POST(req) {
    await dbConnect();

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    try {
        // Total users include 'user', 'freeze', and 'block'
        const totalUsers = await UserModel.countDocuments({
            defaultdata: { $in: ["user", "freeze", "block"] }
        });

        // Active users
        const activeUsers = await UserModel.countDocuments({
            usertype: "1",
            defaultdata: "user"
        });

        // Pending users
        const pendingUsers = await UserModel.countDocuments({
            usertype: "0",
            defaultdata: "user"
        });

        // Suspended users
        const suspendedUsers = await UserModel.countDocuments({
            defaultdata: { $nin: ["user"] }
        });

        // Today’s Registrations
        const todayRegistrations = await UserModel.countDocuments({
            createdAt: { $gte: todayStart, $lte: todayEnd }
        });

        // Today’s Green (Activated users)
        const todayGreen = await UserModel.countDocuments({
            activedate: { $gte: todayStart, $lte: todayEnd }
        });

        return Response.json({
            totalUsers,
            activeUsers,
            pendingUsers,
            suspendedUsers,
            todayRegistrations,
            todayGreen,
        });
    } catch (error) {
        console.error("Error getting user stats:", error);
        return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
    }
}
