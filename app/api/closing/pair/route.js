import dbConnect from "@/lib/dbConnect";
import PaymentHistoryModel from "@/model/PaymentHistory";
import ClosingHistoryModel from "@/model/ClosingHistory";
import UserModel from "@/model/User";

async function getTotalSPForDS(dsid) {
  const saoDsCodes = new Set();
  const sgoDsCodes = new Set();
  const allDsCodes = new Set([dsid]);
  const queue = [{ ds: dsid, group: null }];
  const seen = new Set([dsid]);

  while (queue.length > 0) {
    const { ds, group } = queue.shift();

    const users = await UserModel.find({ pdscode: ds }).select("dscode pdscode group");

    for (const user of users) {
      if (seen.has(user.dscode)) continue;
      seen.add(user.dscode);
      allDsCodes.add(user.dscode);

      let nextGroup = group;
      if (!group && (user.group === "SAO" || user.group === "SGO")) {
        nextGroup = user.group;
      }

      if (nextGroup === "SAO") saoDsCodes.add(user.dscode);
      else if (nextGroup === "SGO") sgoDsCodes.add(user.dscode);

      queue.push({ ds: user.dscode, group: nextGroup });
    }
  }

  // ✅ Filter only payments with pairstatus: false
  const payments = await PaymentHistoryModel.find({
    dsid: { $in: Array.from(allDsCodes) },
    pairstatus: false,
  }).select("dsid sp group");

  const saoDownlines = payments.filter(p => saoDsCodes.has(p.dsid));
  const sgoDownlines = payments.filter(p => sgoDsCodes.has(p.dsid));
  const mainUserPayments = payments.filter(p => p.dsid === dsid);

  for (const pay of mainUserPayments) {
    if (pay.group === "SAO") {
      saoDownlines.unshift(pay);
    } else if (pay.group === "SGO") {
      sgoDownlines.unshift(pay);
    }
  }

  const totalsaosp = saoDownlines.reduce((acc, cur) => acc + Number(cur.sp || 0), 0);
  const totalsgosp = sgoDownlines.reduce((acc, cur) => acc + Number(cur.sp || 0), 0);

  return { totalsaosp, totalsgosp };
}

export async function POST(req) {
  await dbConnect();

  try {
    const allUsers = await UserModel.find().select("dscode name acnumber ifscCode bankName");
    const successfulDsids = [];
    for (const user of allUsers) {
      const dsid = user.dscode;

      const { totalsaosp, totalsgosp } = await getTotalSPForDS(dsid);
      const matchingSP = Math.min(totalsaosp, totalsgosp);
      const totalAmount = matchingSP * 10;

      // ✅ Skip if total is 0 or less
      if (totalAmount <= 0) continue;
      successfulDsids.push(dsid);

      const charges = totalAmount * 0.05;
      const payamount = totalAmount - charges;
      const closingEntry = new ClosingHistoryModel({
        dsid,
        name: user.name || "N/A",
        acnumber: user.acnumber || "N/A",
        ifscCode: user.ifscCode || "N/A",
        bankName: user.bankName || "N/A",
        amount: totalAmount,
        charges: charges.toFixed(2),  // keep 2 decimal places as string
        payamount: payamount.toFixed(2),
        date: new Date().toISOString().split("T")[0],
      });

      await closingEntry.save();

    }

    await PaymentHistoryModel.updateMany(
      {
        dsid: { $in: successfulDsids },
        pairstatus: false,
      },
      { $set: { pairstatus: true } }
    );

    return new Response(JSON.stringify({ message: "Closing history created for users with amount > 0 and unpaid pairs only." }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error generating closing history:", error);
    return new Response(JSON.stringify({ message: "Something went wrong.", error: error.message }), {
      status: 500,
    });
  }
}
