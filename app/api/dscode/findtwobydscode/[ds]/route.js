import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export async function GET(request) {
  await dbConnect();

  try {

    const url = new URL(request.url);
    const ds = url.pathname.split("/").pop();
    const usertype = url.searchParams.get("usertype");
    const dscode = url.searchParams.get("dscode");
    if (!ds) {
      return Response.json(
        {
          message: "Invalid request! ds parameter is missing.",
          success: false,
        },
        { status: 400 }
      );
    }


    const mainUser = await UserModel.findOne({ dscode: ds });
    if (!mainUser) {
      return Response.json(
        {
          message: "User not found!",
          success: false,
        },
        { status: 200 }
      );
    }

    // Find two related users sorted by createdAt (oldest first)
    const relatedUsers = await UserModel.find({ pdscode: ds })
      .sort({ createdAt: 1 }) // Ascending order (oldest first)
      .limit(2);

    // Return the response with separate fields
    return Response.json(
      {
        success: true,
        mainUser, // Separate main user
        relatedUsers, // Array of related users
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error on getting user:", error);
    return Response.json(
      {
        message: "Error on getting user!",
        success: false,
      },
      { status: 500 }
    );
  }
}
