import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import OrderModel from "@/model/Order";
import bcrypt from "bcryptjs";
import PaymentHistoryModel from "@/model/PaymentHistory";

export async function PATCH(req) {
    await dbConnect();

    try {
        const data = await req.json();

        if (!data.id) {
            return new Response(
                JSON.stringify({ success: false, message: "User ID is required!" }),
                { status: 400 }
            );
        }

        const user = await UserModel.findById(data.id);
        if (!user) {
            return new Response(
                JSON.stringify({ success: false, message: "User not found!" }),
                { status: 404 }
            );
        }

        // Activation logic
        if (data.usertype === "1") {
            data.activedate = new Date();

            // 1. Get orders of user where status = true
            const orders = await OrderModel.find({
                dscode: user.dscode,
                status: true,
            });

            // 2. Separate orders by salegroup
            let saoTotal = 0;
            let sgoTotal = 0;

            for (const order of orders) {
                const sp = Number(order.totalsp || 0);
                if (order.salegroup === "SAO") saoTotal += sp;
                if (order.salegroup === "SGO") sgoTotal += sp;
            }

            // 3. Deduct from active user's saosp & sgosp
            const newSaosp = Math.max(0, (Number(user.saosp || 0) - saoTotal));
            const newSgosp = Math.max(0, (Number(user.sgosp || 0) - sgoTotal));

            data.saosp = newSaosp.toString();
            data.sgosp = newSgosp.toString();

            const totalSPTransferred = saoTotal + sgoTotal;

            // 4. Transfer SP to upperline user based on active user's group
            const upperlineUser = await UserModel.findOne({ dscode: user.pdscode });

            if (upperlineUser) {
                const upperData = {};

                if (user.group === "SAO") {
                    upperData.saosp = (Number(upperlineUser.saosp || 0) + totalSPTransferred).toString();
                } else if (user.group === "SGO") {
                    upperData.sgosp = (Number(upperlineUser.sgosp || 0) + totalSPTransferred).toString();
                }

                await UserModel.updateOne({ _id: upperlineUser._id }, { $set: upperData });
                // Upperline user gets SP
                await PaymentHistoryModel.create({
                    dsid: upperlineUser.dscode,
                    dsgroup: upperlineUser.group,
                    amount: "0",
                    sp: totalSPTransferred.toString(),
                    group: user.group,
                    type: "user active",
                    referencename: user.dscode,
                    pairstatus: false,
                    monthlystatus: false,
                });

                // Active user loses SP
                await PaymentHistoryModel.create({
                    dsid: user.dscode,
                    dsgroup: user.group,
                    amount: "0",
                    sp: `-${totalSPTransferred}`,
                    group: user.group,
                    type: "SP transferred to upperline",
                    referencename: upperlineUser?.dscode || "",
                    pairstatus: false,
                    monthlystatus: false,
                });


            }
        }

        // Only hash password if changed
        if (data.password && data.password !== user.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }

        // Add level info if provided
        if (data.level) {
            data.LevelDetails = [
                ...(user.LevelDetails || []),
                {
                    levelName: data.level,
                    sao: user.saosp || "",
                    sgo: user.sgosp || "",
                },
            ];
        }

        // Final update
        await UserModel.updateOne({ _id: data.id }, { $set: data });

        return new Response(
            JSON.stringify({ success: true, message: "Updated successfully!" }),
            { status: 200 }
        );

    } catch (error) {
        console.error("User update error:", error);
        return new Response(
            JSON.stringify({ success: false, message: "Internal server error. Try again later." }),
            { status: 500 }
        );
    }
}
