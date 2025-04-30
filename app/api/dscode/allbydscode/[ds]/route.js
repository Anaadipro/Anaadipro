import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export async function GET(request) {
  await dbConnect();

  try {
    const url = new URL(request.url);
    const ds = url.pathname.split("/").pop();

    if (!ds) {
      return Response.json(
        { message: "Invalid request! ds parameter is missing.", success: false },
        { status: 400 }
      );
    }

    const mainUser = await UserModel.findOne({ dscode: ds });
    if (!mainUser) {
      return Response.json(
        { message: "User not found!", success: false },
        { status: 404 }
      );
    }

    // Recursive function to get all children in a chain
    async function getChainUsers(dscode) {
      const children = await UserModel.find({ pdscode: dscode });
      const allDescendants = [];

      for (const child of children) {
        allDescendants.push(child);
        const subDescendants = await getChainUsers(child.dscode);
        allDescendants.push(...subDescendants);
      }

      return allDescendants;
    }

    const relatedUsers = await getChainUsers(ds);

    return Response.json(
      {
        success: true,
        mainUser,
        relatedUsers, // full chain of users
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error on getting user:", error);
    return Response.json(
      { message: "Error on getting user!", success: false },
      { status: 500 }
    );
  }
}
