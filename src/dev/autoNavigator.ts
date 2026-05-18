import { getErrors } from "../utils/runtimeErrorTracker";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const autoNavigator = async () => {
  console.log("🚀 STARTING FULL APP RUNTIME TEST");

  const routes = [
    "/", // Dashboard
    "/daybook",
    "/kissan-khata",
    "/add-kissan",
    "/clients",
    "/add-client",
    "/investors",
    "/add-investor",
    "/properties",
    "/add-property",
    "/expenses",
    "/ledger",
    "/gst-book",
    "/staff-ledger",
    "/add-staff",
    "/loan-ledger",
    "/add-lending-loan",
    "/add-borrowing-loan",
    "/reports",
    "/add-transaction",
    "/generate-noc",
    "/add-pre-sale-noc",
    "/add-post-sale-noc",
    "/add-loan-noc",
    "/add-post-job-noc",
    "/generate-cheque",
    "/pending-cheques",
    "/pending-receipts",
    "/pending-agreements",
    "/generate-receipt",
    "/documents",
    "/bank-manager",
    "/settings",
    "/database",
    "/database/categories"
  ];

  const allRoutes = [...routes];

  for (const route of allRoutes) {
    try {
      console.log(`🔍 Testing: ${route}`);
      window.location.hash = '#' + route;
      await delay(1500);
    } catch (err) {
      console.error(`❌ Navigation crash on ${route}`, err);
    }
  }

  await delay(1000);

  const errors = getErrors();

  console.log("🧠 RUNTIME ERROR REPORT:");
  if (errors.length === 0) {
    console.log("✅ NO RUNTIME ERRORS FOUND");
  } else {
    console.log(`❌ FOUND ${errors.length} ERRORS`);
    errors.forEach((e: any) => console.error("  -", e.message));
  }
};