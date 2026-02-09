import dbConnect from "@/lib/dbConnect";
import ClosingHistoryModel from "@/model/ClosingHistory";

export const GET = async (request, { params }) => {
  await dbConnect();

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const dscode = params.dsid;

  const filter = {
    dsid: dscode,
    status: true,
  };

  try {
    const data = await ClosingHistoryModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await ClosingHistoryModel.countDocuments(filter);

    return Response.json({
      message: "Data fetched successfully!",
      success: true,
      data,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching closing history:", error);
    return Response.json(
      { message: "Failed to fetch data", success: false },
      { status: 500 }
    );
  }
};
