import mongoose, { Schema } from "mongoose";

const MonthlyClosingHistorySchema = new Schema(

    {
        dsid: { type: String, required: true },
        name: { type: String, required: true },
        acnumber: { type: String, },
        ifscCode: { type: String, },
        bankName: { type: String, },

        amount: { type: String, required: true },
        charges: { type: String, required: true },
        payamount: { type: String, required: true },
        date: { type: String, required: true },
        status: { type: Boolean, required: true, default: false },

        defaultdata: { type: String, required: true, default: "monthlyHistory" }

    },
    { timestamps: true }
);

const MonthlyClosingHistoryModel =
    mongoose.models.MonthlyClosingHistory || mongoose.model("MonthlyClosingHistory", MonthlyClosingHistorySchema);

export default MonthlyClosingHistoryModel