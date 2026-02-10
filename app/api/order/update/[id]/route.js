import dbConnect from "@/lib/dbConnect";
import OrderModel from "@/model/Order";
import mongoose from "mongoose";
import UserModel from "@/model/User";

export async function PATCH(req, { params }) {
    await dbConnect();

    try {
        const { id } = await params;
        const data = await req.json();

        // Start a transaction
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Update the order
            const updatedOrder = await OrderModel.findByIdAndUpdate(
                id,
                data,
                { new: true, session }
            );

            if (!updatedOrder) {
                await session.abortTransaction();
                session.endSession();
                return Response.json({
                    message: "order not found",
                    success: false
                }, { status: 404 });
            }

            // Find the user by dscode from the order
            const user = await UserModel.findOne({
                dscode: updatedOrder.dscode
            }).session(session);

            if (user) {
                // Convert values to numbers for calculation
                let currentEarnsp = parseFloat(user.earnsp) || 0;
                let currentSaosp = parseFloat(user.saosp) || 0;
                let currentSgosp = parseFloat(user.sgosp) || 0;
                const orderTotalSp = parseFloat(updatedOrder.totalsp) || 0;

                if (data.status !== undefined) {
                    if (data.cancelled === true) {
                        // Cancelled: reverse SP
                        currentEarnsp -= orderTotalSp;
                        if (updatedOrder.salegroup === "SAO") {
                            currentSaosp -= orderTotalSp;
                        } else if (updatedOrder.salegroup === "SGO") {
                            currentSgosp -= orderTotalSp;
                        }
                        // Prevent negative values
                        currentEarnsp = Math.max(currentEarnsp, 0);
                        currentSaosp = Math.max(currentSaosp, 0);
                        currentSgosp = Math.max(currentSgosp, 0);
                    } else if (data.status !== undefined) {
                        if (data.status === true) {
                            currentEarnsp += orderTotalSp;
                            if (updatedOrder.salegroup === "SAO") {
                                currentSaosp += orderTotalSp;
                            } else if (updatedOrder.salegroup === "SGO") {
                                currentSgosp += orderTotalSp;
                            }
                        } else if (data.status === false) {
                            currentEarnsp -= orderTotalSp;
                            if (updatedOrder.salegroup === "SAO") {
                                currentSaosp -= orderTotalSp;
                            } else if (updatedOrder.salegroup === "SGO") {
                                currentSgosp -= orderTotalSp;
                            }
                            currentEarnsp = Math.max(currentEarnsp, 0);
                            currentSaosp = Math.max(currentSaosp, 0);
                            currentSgosp = Math.max(currentSgosp, 0);
                        }
                    }


                    // Update user SP values
                    await UserModel.updateOne(
                        { dscode: updatedOrder.dscode },
                        {
                            earnsp: currentEarnsp.toString(),
                            saosp: currentSaosp.toString(),
                            sgosp: currentSgosp.toString()
                        },
                        { session }
                    );

                    // ----- 💸 Handle WalletDetails for 100 SP matching -----

                    // -------------------------------------------------------
                }
            }

            // Commit transaction
            await session.commitTransaction();
            session.endSession();

            return Response.json({
                message: "Order updated successfully",
                success: true,
                data: updatedOrder
            }, { status: 200 });

        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }

    } catch (error) {
        console.log(error);
        return Response.json({
            message: "Error updating order",
            success: false
        }, { status: 500 });
    }
}
