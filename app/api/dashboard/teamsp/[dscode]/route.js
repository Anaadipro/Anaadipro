import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import OrderModel from "@/model/Order";
import moment from "moment";

async function buildSubTree(ds, allUsersMap, visited = new Set()) {
  if (visited.has(ds)) return [];
  visited.add(ds);

  const directMembers = allUsersMap.get(ds) || [];
  let team = [...directMembers];

  for (const member of directMembers) {
    const subTeam = await buildSubTree(member.dscode, allUsersMap, visited);
    team.push(...subTeam);
  }

  return team;
}

export async function GET(request) {
  await dbConnect();

  try {
    const url = new URL(request.url);
    const ds = url.pathname.split("/").pop();

    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");

    const fromDate = from ? new Date(from) : null;
    const toDate = to ? new Date(to) : null;

    if (!ds) {
      return Response.json({ message: "Invalid request! dscode missing.", success: false }, { status: 400 });
    }

    const mainUser = await UserModel.findOne({ dscode: ds });
    if (!mainUser) {
      return Response.json({ message: "User not found!", success: false }, { status: 404 });
    }

    const userFilter = {};
    if (fromDate && toDate) {
      userFilter.createdAt = { $gte: fromDate, $lte: toDate };
    }

    const allUsers = await UserModel.find(userFilter);
    const allUsersMap = new Map();
    allUsers.forEach(user => {
      if (!allUsersMap.has(user.pdscode)) {
        allUsersMap.set(user.pdscode, []);
      }
      allUsersMap.get(user.pdscode).push(user);
    });

    const directChildren = allUsersMap.get(ds) || [];

    // Counters
    let totalSGO = 0, totalSAO = 0;
    let totalActiveSGO = 0, totalActiveSAO = 0;
    let totalEarnSP = 0, totalSaoSP = 0, totalSgoSP = 0;

    // ✅ Include self user in counters
    if (mainUser.group === "SAO") {
      totalSAO += 1;
      if (mainUser.usertype === "1") totalActiveSAO += 1;
      totalEarnSP += parseFloat(mainUser.earnsp) || 0;
      totalSaoSP += parseFloat(mainUser.saosp) || 0;
      totalSgoSP += parseFloat(mainUser.sgosp) || 0;
    }

    if (mainUser.group === "SGO") {
      totalSGO += 1;
      if (mainUser.usertype === "1") totalActiveSGO += 1;
      totalEarnSP += parseFloat(mainUser.earnsp) || 0;
      totalSaoSP += parseFloat(mainUser.saosp) || 0;
      totalSgoSP += parseFloat(mainUser.sgosp) || 0;
    }

    for (const child of directChildren) {
      const visited = new Set();
      const subTree = await buildSubTree(child.dscode, allUsersMap, visited);
      const fullGroup = [child, ...subTree]; // Include the direct child

      const isSAO = child.group === "SAO";
      const isSGO = child.group === "SGO";

      // Count total members & actives
      if (isSAO) {
        totalSAO += fullGroup.length;
        totalActiveSAO += fullGroup.filter(u => u.usertype === "1").length;
      } else if (isSGO) {
        totalSGO += fullGroup.length;
        totalActiveSGO += fullGroup.filter(u => u.usertype === "1").length;
      }

      // Accumulate ALL SP (earnsp + saosp + sgosp) into the direct child group bucket
      fullGroup.forEach(u => {
        totalEarnSP += parseFloat(u.earnsp) || 0;

        const totalUserSP =
          (parseFloat(u.saosp) || 0) +
          (parseFloat(u.sgosp) || 0);

        if (isSAO) {
          totalSaoSP += totalUserSP;
        } else if (isSGO) {
          totalSgoSP += totalUserSP;
        }
      });
    }



    const totalIncome = (parseFloat(mainUser.earnsp) || 0) * 10;
    const startOfWeek = moment().startOf("week").toDate();
    const endOfWeek = moment().endOf("week").toDate();

    const userOrders = await OrderModel.find({
      status: true,
      dscode: ds,
      createdAt: { $gte: startOfWeek, $lte: endOfWeek }
    });

    let currentWeekSaoSP = 0, currentWeekSgoSP = 0;
    userOrders.forEach(order => {
      const totalSP = parseFloat(order.totalsp) || 0;
      if (order.salegroup === "SAO") currentWeekSaoSP += totalSP;
      if (order.salegroup === "SGO") currentWeekSgoSP += totalSP;
    });

    return Response.json({
      success: true,
      dscode: ds,
      mainUser: {
        dscode: mainUser.dscode,
        level: mainUser.level,
        saosp: mainUser.saosp,
        sgosp: mainUser.sgosp,
        earnsp: mainUser.earnsp,
        group: mainUser.group,
      },
      totalSGO,
      totalSAO,
      totalActiveSGO,
      totalActiveSAO,
      totalEarnSP,
      totalSaoSP,
      totalSgoSP,
      totalIncome,
      currentWeekSaoSP,
      currentWeekSgoSP,
    }, { status: 200 });

  } catch (error) {
    console.error("Error getting team stats:", error);
    return Response.json({ message: "Error fetching data!", success: false }, { status: 500 });
  }
}
