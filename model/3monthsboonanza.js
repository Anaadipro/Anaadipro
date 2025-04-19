import mongoose, { Schema } from "mongoose";

const MonthsSchema = new Schema(
    {
        title: { type: String, required: true },
        sao: { type: String, required: true },
        sgo: { type: String, required: true },
        datefrom: { type: String, required: true },
        dateto: { type: String, required: true },
        defaultdata: { type: String, required: true, default: "months" }
    },
    { timestamps: true }
);

const MonthsModel =
    mongoose.models.Monthstest4 || mongoose.model("Monthstest4", MonthsSchema);

export default MonthsModel;
