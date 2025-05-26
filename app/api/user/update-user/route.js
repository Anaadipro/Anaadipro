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

        // Set activation date if usertype is 1
        if (data.usertype === "1") {
            data.activedate = new Date();
        }

        // Hash password only if changed
        if (data.password && data.password !== user.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }

        const activesp = Number(data.activesp || 0);
        let earnsp = Number(user.earnsp || 0);

        const parentUpdates = [];
        const paymentHistories = [];

        if (data.usertype && data.usertype !== user.usertype) {
            // Deduct activesp from user's earnsp
            earnsp -= activesp;
            data.earnsp = earnsp.toString();

            let currentParentCode = user.pdscode;
            let currentChildGroup = user.group;

            // Fetch all users once to avoid multiple DB hits
            const allParents = await UserModel.find({}).lean();
            const parentMap = Object.fromEntries(allParents.map(u => [u.dscode, u]));

            while (currentParentCode && currentParentCode !== "0") {
                const parent = parentMap[currentParentCode];
                if (!parent) break;

                const update = {};
                if (currentChildGroup === "SAO") {
                    update.saosp = (Number(parent.saosp || 0) + activesp).toString();
                } else if (currentChildGroup === "SGO") {
                    update.sgosp = (Number(parent.sgosp || 0) + activesp).toString();
                }

                parentUpdates.push({
                    updateOne: {
                        filter: { _id: parent._id },
                        update: { $set: update },
                    },
                });

                paymentHistories.push({
                    dsid: parent.dscode,
                    dsgroup: parent.group,
                    amount: "0",
                    sp: activesp.toString(),
                    group: currentChildGroup,
                    type: "update user",
                    referencename: user.name || "",
                });

                currentChildGroup = parent.group;
                currentParentCode = parent.pdscode;
            }

            if (parentUpdates.length > 0) {
                await UserModel.bulkWrite(parentUpdates);
            }

            if (paymentHistories.length > 0) {
                await PaymentHistoryModel.insertMany(paymentHistories);
            }
        }

        // Append level info if provided
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
