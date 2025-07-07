// File: app/api/order/create/route.js

import dbConnect from "@/lib/dbConnect";
import OrderModel from "@/model/Order"; // Your OrderModel
import ProductModel from "@/model/Product"; // Your ProductModel
import mongoose from "mongoose";

export async function POST(request) {
    await dbConnect();

    // A session is required to use transactions
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const orderData = await request.json();
        const { productDetails } = orderData;

        if (!productDetails || productDetails.length === 0) {
            throw new Error("Order must contain at least one product.");
        }

        // Use a for...of loop to handle async/await correctly inside the transaction
        for (const item of productDetails) {
            // Find the product within the current transaction session
            const product = await ProductModel.findOne({ productname: item.product }).session(session);

            if (!product) {
                // If any product is not found, the entire order is invalid.
                throw new Error(`Product "${item.product}" not found in inventory.`);
            }

            const currentStock = Number(product.quantity);
            const orderedQuantity = Number(item.quantity);

            // Validate quantities
            if (isNaN(currentStock) || isNaN(orderedQuantity)) {
                 throw new Error(`Invalid quantity value for product "${item.product}".`);
            }

            // Check for sufficient stock
            if (currentStock < orderedQuantity) {
                // If stock is insufficient, the order cannot be placed.
                throw new Error(`Insufficient stock for ${item.product}. Available: ${currentStock}, Ordered: ${orderedQuantity}`);
            }

            // If stock is sufficient, deduct the quantity
            const newStock = currentStock - orderedQuantity;
            
            // Update the product's quantity within the transaction
            await ProductModel.updateOne(
                { _id: product._id },
                { $set: { quantity: newStock.toString() } }
            ).session(session);
        }

        // If all stock updates were successful, create the new order document
        const newOrder = new OrderModel(orderData);
        // Save the order within the same transaction
        await newOrder.save({ session });
        
        // If we reach here, all operations were successful. Commit the transaction.
        await session.commitTransaction();

        return new Response(JSON.stringify({
            success: true,
            message: "Order created successfully and stock updated.",
            order: newOrder,
        }), { 
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        // If any error occurred at any step, abort the entire transaction.
        // This will automatically undo all previous database changes in this session.
        await session.abortTransaction();

        console.error("Order creation failed:", error.message);
        return new Response(JSON.stringify({
            success: false,
            message: error.message || "Failed to create order due to an internal error.",
        }), { 
            status: 400, // Use 400 for client-side errors like insufficient stock
            headers: { 'Content-Type': 'application/json' }
        });

    } finally {
        // Always end the session when you're done.
        session.endSession();
    }
}
