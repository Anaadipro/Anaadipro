import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";

export async function PATCH(req) {
    await dbConnect();

    try {
        const data = await req.json();

        if (!data.email || !data.password) {
            return new Response(
                JSON.stringify({ success: false, message: "Email and new password are required!" }),
                { status: 400 }
            );
        }

        const user = await UserModel.findOne({ email: data.email });

        if (!user) {
            return new Response(
                JSON.stringify({ success: false, message: "User not found!" }),
                { status: 404 }
            );
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);

        await UserModel.updateOne(
            { email: data.email },
            { $set: { password: hashedPassword } }
        );

        return new Response(
            JSON.stringify({ success: true, message: "Password updated successfully!" }),
            { status: 200 }
        );
    } catch (error) {
        console.error("Password update error:", error);
        return new Response(
            JSON.stringify({ success: false, message: "Internal server error. Try again later." }),
            { status: 500 }
        );
    }
}
