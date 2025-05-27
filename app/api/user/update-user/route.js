import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import PaymentHistoryModel from "@/model/PaymentHistory";
import bcrypt from "bcryptjs";

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

        // If usertype is "1", perform activation logic
        if (data.usertype === "1") {
            data.activedate = new Date();

            const activesp = Number(data.activesp || 0);

            // Add activesp to self's saosp or sgosp based on group
            if (user.group === "SAO") {
                data.saosp = (Number(user.saosp || 0) + activesp).toString();
            } else if (user.group === "SGO") {
                data.sgosp = (Number(user.sgosp || 0) + activesp).toString();
            }

            // Create payment history for self
            await PaymentHistoryModel.create({
                dsid: user.dscode,
                dsgroup: user.group,
                amount: "0",
                sp: activesp.toString(),
                group: user.group,
                type: "update user",
                referencename: user.name || "",
            });
        }

        // Only hash password if it's changed
        if (data.password && data.password !== user.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }

        // Add new level info if provided
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

        // Final user update
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
