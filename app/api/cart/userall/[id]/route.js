import dbConnect from "@/lib/dbConnect";
import CartModel from "@/model/Cart";
import ProductModel from "@/model/Product";

export async function GET(request, { params }) {
    await dbConnect();

    try {
        const {id} = await params;

        const data = await CartModel.aggregate([
            {
                // Stage 1: Find the cart document(s)
                $match: { dscode: id }
            },
            {
                // Stage 2: Unpack the productDetails array to process each item
                $unwind: "$productDetails"
            },
            {
                // Stage 3: Join with products to get availability
                $lookup: {
                    from: "producttest8",
                    localField: "productDetails.product",
                    foreignField: "productname",
                    as: "productInfo"
                }
            },
            {
                // Stage 4: Unwind the lookup result. Use preserveNullAndEmptyArrays
                // to keep cart items even if the product was deleted.
                $unwind: {
                    path: "$productInfo",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                // Stage 5: Re-group the items back into a single cart document
                $group: {
                    // Group by the original cart's ID
                    _id: "$_id",
                    
                    // Use $first to restore the original top-level fields
                    dscode: { $first: "$dscode" },
                    totalsp: { $first: "$totalsp" },
                    netamount: { $first: "$netamount" },
                    createdAt: { $first: "$createdAt" },
                    updatedAt: { $first: "$updatedAt" },

                    // Rebuild the productDetails array
                    productDetails: {
                        $push: {
                            // Merge the original productDetails object...
                            $mergeObjects: [
                                "$productDetails",
                                // ...with the new availableQuantity field
                                { availableQuantity: "$productInfo.quantity" }
                            ]
                        }
                    }
                }
            }
        ]);

        if (!data || data.length === 0) {
            return Response.json(
                {
                    message: "Cart data not found!",
                    success: false,
                },
                { status: 200 }
            );
        }

        return Response.json({ data, success: true }, { status: 200 });

    } catch (error) {
        console.error("Error fetching aggregated cart data:", error);
        return Response.json(
            {
                message: "Error fetching data!",
                success: false,
            },
            { status: 500 }
        );
    }
}