import UserModel from "@/model/User";
import dbConnect from "@/lib/dbConnect";
import bcrypt from "bcryptjs";

export async function POST(req) {
    await dbConnect();

    try {
        const data = await req.json();

        if (!data.name || !data.email || !data.password || !data.mobileNo || !data.group || !data.pdscode) {
            return new Response(
                JSON.stringify({ success: false, message: "All fields are required!" }),
                { status: 400 }
            );
        }

        const alreadyUser = await UserModel.findOne({ email: data.email }).lean();
        if (alreadyUser) {
            return new Response(
                JSON.stringify({ success: false, message: "User already exists with this email!" }),
                { status: 400 }
            );
        }
        const referrerExists = await UserModel.findOne({ dscode: data.pdscode }).lean();
        if (!referrerExists) {
            return new Response(
                JSON.stringify({ success: false, message: "Invalid referral code!" }),
                { status: 400 }
            );
        }
        const plainPassword = data.password;
        const hashedPassword = await bcrypt.hash(data.password, 10);

        const newUser = new UserModel({
            ...data,
            password: hashedPassword,
        });

        await newUser.save();

        return new Response(
            JSON.stringify({
                success: true, message: "User registered successfully", dscode: newUser.dscode,
                password: plainPassword,
            }),
            { status: 201 }
        );

    } catch (error) {
        console.error("User registration error:", error);

        if (error.name === "ValidationError") {
            return new Response(
                JSON.stringify({ success: false, message: "Invalid input data!" }),
                { status: 400 }
            );
        }

        return new Response(
            JSON.stringify({ success: false, message: "Internal server error. Try again later." }),
            { status: 500 }
        );
    }
}
