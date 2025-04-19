import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export async function GET(request, { params }) {
  await dbConnect();

  try {

    const { emailid } = await params;


    const user = await UserModel.findOne({ email: emailid });
    if (!user) {
      return Response.json(
        {
          message: "User not found!",
          success: false,
        },
        { status: 404 }
      );
    }

    return Response.json(user, { status: 200 });
  } catch (error) {
    console.log("Error on getting user:", error);
    return Response.json(
      {
        message: "Error on getting user!",
        success: false,
      },
      { status: 500 }
    );
  }
}
