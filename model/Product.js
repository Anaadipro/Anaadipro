import mongoose, { Schema } from "mongoose";

const ProductSchema = new Schema(

    {
        image: { type: String, required: true },
        productname: { type: String, required: true },
        group: { type: String, required: true },
        dp: { type: String, required: true },
        sp: { type: String, required: true },
        mrp: { type: String, required: true },

        hsn: { type: String, },
        taxvalue: { type: String, },
        cgst: { type: String, },
        sgst: { type: String, },
        igst: { type: String, },

        quantity: { type: String, },

        defaultdata: { type: String, required: true, default: "product" }

    },
    { timestamps: true }
);

const ProductModel =
    mongoose.models.Producttest8 || mongoose.model("Producttest8", ProductSchema);

export default ProductModel