import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import OrderModel from "@/model/Order";
import moment from "moment";

async function buildTeamTree(ds, allUsersMap, visited = new Set()) {
  if (visited.has(ds)) return [];
  visited.add(ds);

  const directMembers = allUsersMap.get(ds) || [];
  let team = [...directMembers];

  for (const member of directMembers) {
    const subTeam = await buildTeamTree(member.dscode, allUsersMap, visited);
    team.push(...subTeam);
  }

  return team;
}

export async function GET(request) {
  await dbConnect();

  try {
    const url = new URL(request.url);
    const ds = url.pathname.split("/").pop();

    if (!ds) {
      return Response.json({ message: "Invalid request! dscode missing.", success: false }, { status: 400 });
    }

    const mainUser = await UserModel.findOne({ dscode: ds });
    if (!mainUser) {
      return Response.json({ message: "User not found!", success: false }, { status: 404 });
    }

    // Fetch all users at once
    const allUsers = await UserModel.find({});
    const allUsersMap = new Map();

    allUsers.forEach(user => {
      if (!allUsersMap.has(user.pdscode)) {
        allUsersMap.set(user.pdscode, []);
      }
      allUsersMap.get(user.pdscode).push(user);
    });

    // Build the team tree
    const teamUsers = await buildTeamTree(ds, allUsersMap);
    teamUsers.unshift(mainUser);

    // Same analytics
    const totalSGO = teamUsers.filter(user => user.group === "SGO").length;
    const totalSAO = teamUsers.filter(user => user.group === "SAO").length;
    const totalActiveSGO = teamUsers.filter(user => user.group === "SGO" && user.usertype === "1").length;
    const totalActiveSAO = teamUsers.filter(user => user.group === "SAO" && user.usertype === "1").length;

    let totalEarnSP = 0, totalSaoSP = 0, totalSgoSP = 0;
    teamUsers.forEach(user => {
      totalEarnSP += parseFloat(user.earnsp) || 0;
      totalSaoSP += parseFloat(user.saosp) || 0;
      totalSgoSP += parseFloat(user.sgosp) || 0;
    });

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
