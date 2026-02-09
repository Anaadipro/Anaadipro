import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import OrderModel from "@/model/Order";
import { NextResponse } from "next/server";

export async function GET(request) {
  await dbConnect();

  try {
    const url = new URL(request.url);
    // URL से dscode निकालना (e.g., /api/user/DS123)
    const ds = url.pathname.split("/").pop();

    if (!ds) {
      return NextResponse.json({ message: "Invalid request! dscode missing.", success: false }, { status: 400 });
    }

    // 1. यूजर की बेसिक जानकारी प्राप्त करें
    const user = await UserModel.findOne({ dscode: ds });
    if (!user) {
      return NextResponse.json({ message: "User not found!", success: false }, { status: 404 });
    }

    // 2. केवल इस यूजर के Approved (status: true) ऑर्डर्स निकालें
    const approvedOrders = await OrderModel.find({
      dscode: ds,
      status: true
    });

    // 3. SP कैलकुलेट करें (SAO और SGO के आधार पर)
    let totalSaoSP = 0;
    let totalSgoSP = 0;

    approvedOrders.forEach(order => {
      const spValue = parseFloat(order.totalsp) || 0;
      if (order.salegroup === "SAO") {
        totalSaoSP += spValue;
      } else if (order.salegroup === "SGO") {
        totalSgoSP += spValue;
      }
    });

    // 4. फाइनल रिस्पॉन्स भेजें
    return NextResponse.json({
      success: true,
      message: "User approved orders calculated successfully",
      data: {
        dscode: user.dscode,
        name: user.name, // अगर मॉडल में है तो
        group: user.group,
        calculatedSaoSP: Number(totalSaoSP.toFixed(2)),
        calculatedSgoSP: Number(totalSgoSP.toFixed(2)),
        totalCombinedSP: Number((totalSaoSP + totalSgoSP).toFixed(2)),
        approvedOrdersCount: approvedOrders.length
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Error calculating user SP:", error);
    return NextResponse.json({ message: "Internal Server Error", success: false }, { status: 500 });
  }
}