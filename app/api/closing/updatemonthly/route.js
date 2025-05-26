import dbConnect from "@/lib/dbConnect";
import MonthlyClosingHistoryModel from "@/model/MonthleClosingHistory";
export const PATCH = async (req) => {
  await dbConnect();

  try {
    const body = await req.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return Response.json(
        { message: "No valid IDs provided", success: false },
        { status: 400 }
      );
    }

    console.log("Updating these IDs:", ids); // Debug log

    const result = await MonthlyClosingHistoryModel.updateMany(
      { _id: { $in: ids } },
      { $set: { status: true } }
    );

    console.log("Update Result:", result); // Debug log

    return Response.json(
      {
        message: `${result.modifiedCount} record(s) updated successfully.`,
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update error:", error);
    return Response.json(
      { message: "Failed to update records", success: false },
      { status: 500 }
    );
  }
};
