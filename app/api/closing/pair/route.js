import dbConnect from "@/lib/dbConnect";
import PaymentHistoryModel from "@/model/PaymentHistory";
import ClosingHistoryModel from "@/model/ClosingHistory";
import UserModel from "@/model/User";

function buildUserGraph(users) {
  const pdscodeToUsers = new Map();
  const dscodeToUser = new Map();

  for (const user of users) {
    if (!pdscodeToUsers.has(user.pdscode)) {
      pdscodeToUsers.set(user.pdscode, []);
    }
    pdscodeToUsers.get(user.pdscode).push(user);
    dscodeToUser.set(user.dscode, user);
  }

  return { pdscodeToUsers, dscodeToUser };
}

function traverseDownlines(startDs, pdscodeToUsers) {
  const queue = [{ ds: startDs, group: null }];
  const allDsCodes = new Set([startDs]);
  const saoDsCodes = new Set();
  const sgoDsCodes = new Set();
  const seen = new Set([startDs]);

  while (queue.length > 0) {
    const { ds, group } = queue.shift();
    const children = pdscodeToUsers.get(ds) || [];

    for (const user of children) {
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

  return { allDsCodes, saoDsCodes, sgoDsCodes };
}

export async function POST(req) {
  await dbConnect();

  try {
    const allUsers = await UserModel.find().lean();
    const allPayments = await PaymentHistoryModel.find().lean(); // ✅ Get all payments, regardless of pairstatus

    const { pdscodeToUsers } = buildUserGraph(allUsers);
    const paymentsByDsId = new Map();

    for (const payment of allPayments) {
      if (!paymentsByDsId.has(payment.dsid)) {
        paymentsByDsId.set(payment.dsid, []);
      }
      paymentsByDsId.get(payment.dsid).push(payment);
    }

    const usedPaymentIds = new Set();

    for (const user of allUsers) {
      const dsid = user.dscode;
      const { allDsCodes, saoDsCodes, sgoDsCodes } = traverseDownlines(dsid, pdscodeToUsers);

      const allRelevantPayments = Array.from(allDsCodes).flatMap(
        id => paymentsByDsId.get(id) || []
      );

      const saoDownlines = allRelevantPayments.filter(
        p => saoDsCodes.has(p.dsid)
      );
      const sgoDownlines = allRelevantPayments.filter(
        p => sgoDsCodes.has(p.dsid)
      );

      const mainUserPayments = paymentsByDsId.get(dsid) || [];

      for (const pay of mainUserPayments) {
        if (pay.group === "SAO") saoDownlines.unshift(pay);
        else if (pay.group === "SGO") sgoDownlines.unshift(pay);
      }

      const totalsaosp = saoDownlines.reduce((acc, cur) => acc + Number(cur.sp || 0), 0);
      const totalsgosp = sgoDownlines.reduce((acc, cur) => acc + Number(cur.sp || 0), 0);

      const matchedSP = Math.min(totalsaosp, totalsgosp);
      const lastMatched = Number(user.lastMatchedSP || 0);
      const newMatchingSP = matchedSP - lastMatched;

      if (newMatchingSP <= 0) continue;

      const totalAmount = newMatchingSP * 10;
      const charges = totalAmount * 0.05;
      const payamount = totalAmount - charges;

      const closingEntry = new ClosingHistoryModel({
        dsid,
        name: user.name || "N/A",
        acnumber: user.acnumber || "N/A",
        ifscCode: user.ifscCode || "N/A",
        bankName: user.bankName || "N/A",
        amount: totalAmount,
        charges: charges.toFixed(2),
        payamount: payamount.toFixed(2),
        date: new Date().toISOString().split("T")[0],
      });

      await closingEntry.save();

      // ✅ Update user's lastMatchedSP
      await UserModel.updateOne(
        { dscode: dsid },
        { $set: { lastMatchedSP: String(lastMatched + newMatchingSP) } }
      );

      // ✅ Only mark unpaired payments (pairstatus: false) used in this closing
      const unpairedSaoUsed = saoDownlines.filter(p => p.pairstatus === false);
      const unpairedSgoUsed = sgoDownlines.filter(p => p.pairstatus === false);
      unpairedSaoUsed.forEach(p => usedPaymentIds.add(p._id.toString()));
      unpairedSgoUsed.forEach(p => usedPaymentIds.add(p._id.toString()));
    }

    if (usedPaymentIds.size > 0) {
      await PaymentHistoryModel.updateMany(
        { _id: { $in: Array.from(usedPaymentIds) } },
        { $set: { pairstatus: true } }
      );
    }

    return new Response(
      JSON.stringify({
        message: "Closing history created. SP calculated from all payments. Pairstatus updated only for unpaired payments used.",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generating closing history:", error);
    return new Response(JSON.stringify({ message: "Something went wrong.", error: error.message }), {
      status: 500,
    });
  }
}
