import mongoose, { Schema } from "mongoose";

const MonthsSchema = new Schema(
  {
    title: { type: String, required: true },
    levels: [
      {
        level: { type: String, required: true },
        sao: { type: String, required: true },
        sgo: { type: String, required: true },
      }
    ],
    datefrom: { type: String, required: true },
    dateto: { type: String, required: true },
    UserDetails: [
      {
        dsid: { type: String, },
        saosp: { type: String, },
        sgosp: { type: String, }
      }
    ],
    defaultdata: { type: String, required: true, default: "months" }
  },
  { timestamps: true }
);

const MonthsModel =
  mongoose.models.Monthstest6 || mongoose.model("Monthstest6", MonthsSchema);

export default MonthsModel;
