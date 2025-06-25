// File: app/api/dashboard/de/[id]/route.js

import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User"; // Make sure this path is correct for your project
import { NextResponse } from "next/server";

export async function GET(request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const skip = (page - 1) * limit;

    // The precise query to find inactive users with non-zero SP
    const filterQuery = {
      usertype: "0",
      $or: [
        { saosp: { $nin: ["0", null, ""] } },
        { sgosp: { $nin: ["0", null, ""] } },
      ],
    };

    // Get the total count of matching documents for pagination
    const totalDocuments = await UserModel.countDocuments(filterQuery);
    const totalPages = Math.ceil(totalDocuments / limit);

    // Fetch the paginated data with all required fields
    const users = await UserModel.find(filterQuery)
      .select(
        "name dscode pdscode saosp sgosp group image mobileNo email"
      )
      .sort({ createdAt: -1 }) // Optional: sort by newest first
      .limit(limit)
      .skip(skip);

    return NextResponse.json({
      success: true,
      message: "Successfully fetched users",
      data: users,
      totalPages: totalPages,
      currentPage: page,
    });

  } catch (error) {
    console.error("Error fetching inactive users with SP:", error);
    return NextResponse.json(
      { message: "Error fetching data from the server", success: false },
      { status: 500 }
    );
  }
}