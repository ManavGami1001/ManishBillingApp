import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();

  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tenantId } = session.user;

  try {
    const invoices = await prisma.invoice.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
    });

    const headers = [
      "Invoice Number",
      "Date",
      "Customer Name",
      "Customer GSTIN",
      "Subtotal",
      "CGST",
      "SGST",
      "Grand Total"
    ];

    const rows = invoices.map((inv) => {
      return [
        inv.invoiceNumber,
        inv.date.toISOString().split("T")[0],
        inv.customerName || "Walk-in",
        inv.customerGstin || "N/A",
        inv.subTotal.toString(),
        inv.totalCgst.toString(),
        inv.totalSgst.toString(),
        inv.grandTotal.toString(),
      ].map((cell) => `"${cell}"`).join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="sales_export.csv"',
      },
    });
  } catch (error: any) {
    console.error("Export Error:", error);
    return NextResponse.json({ error: "Failed to generate export" }, { status: 500 });
  }
}
