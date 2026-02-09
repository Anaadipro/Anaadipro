import dbConnect from "@/lib/dbConnect";
import OrderModel from "@/model/Order";
import ProductModel from "@/model/Product";

export async function POST(request) {
    console.time("order-processing");

    await dbConnect();

    try {
        const orderData = await request.json();
        const { productDetails } = orderData;

        if (!productDetails || productDetails.length === 0) {
            throw new Error("Order must contain at least one product.");
        }

        // Loop through each product and update stock
        for (const item of productDetails) {
            const product = await ProductModel.findOne({ productname: item.product });

            if (!product) {
                throw new Error(`Product "${item.product}" not found in inventory.`);
            }

            const currentStock = Number(product.quantity);
            const orderedQuantity = Number(item.quantity);

            if (isNaN(currentStock) || isNaN(orderedQuantity)) {
                throw new Error(`Invalid quantity value for product "${item.product}".`);
            }

            if (currentStock < orderedQuantity) {
                throw new Error(`Insufficient stock for ${item.product}. Available: ${currentStock}, Ordered: ${orderedQuantity}`);
            }

            const newStock = currentStock - orderedQuantity;

            // Update product quantity (no session)
            await ProductModel.updateOne(
                { _id: product._id },
                { $set: { quantity: newStock.toString() } }
            );
        }

        // Save the new order (no session)
        const newOrder = new OrderModel(orderData);
        await newOrder.save();

        console.timeEnd("order-processing");

        return new Response(JSON.stringify({
            success: true,
            message: "Order created successfully and stock updated.",
            order: newOrder,
        }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error("Order creation failed:", error.message);
        return new Response(JSON.stringify({
            success: false,
            message: error.message || "Failed to create order.",
        }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
