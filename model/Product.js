import mongoose, { Schema } from "mongoose";

const ProductSchema = new Schema(

    {
        image:{ type: String, required: true },
        productname: { type: String, required: true },
        group: { type: String, required: true },
        dp: { type: String, required: true },
        sp: { type: String, required: true },
        mrp: { type: String, required: true },
        defaultdata: { type: String, required: true, default: "product" }

    },
    { timestamps: true }
);

const ProductModel =
    mongoose.models.Producttest4 || mongoose.model("Producttest4", ProductSchema);

export default ProductModel