import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import * as XLSX from 'xlsx';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.tenantId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Get start of current month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const invoices = await prisma.invoice.findMany({
    where: {
      tenantId: session.user.tenantId,
      createdAt: {
        gte: startOfMonth,
      }
    },
    include: {
      items: true
    },
    orderBy: { createdAt: "asc" }
  });

  const data = invoices.map(invoice => {
    const taxableValue = Number(invoice.subTotal);
    const cgst = Number(invoice.totalCgst);
    const sgst = Number(invoice.totalSgst);
    const grandTotal = Number(invoice.grandTotal);

    const totalCost = invoice.items.reduce((sum, item) => {
      return sum + (Number(item.quantity) * Number(item.costPrice));
    }, 0);
    const grossProfit = taxableValue - totalCost;

    return {
      "Invoice Number": invoice.invoiceNumber,
      "Date": invoice.createdAt.toLocaleDateString(),
      "Customer Name": invoice.customerName || "Walk-in",
      "Taxable Value": taxableValue,
      "CGST": cgst,
      "SGST": sgst,
      "Grand Total": grandTotal,
      "Total Cost": totalCost,
      "Gross Profit": grossProfit,
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  
  if (data.length > 0) {
    const headers = Object.keys(data[0]);
    const colWidths = headers.map(header => {
      const headerLength = header.length;
      const maxDataLength = Math.max(...data.map(row => {
        const val = (row as any)[header];
        return val ? val.toString().length : 0;
      }));
      return Math.max(headerLength, maxDataLength) + 2;
    });
    worksheet['!cols'] = colWidths.map(w => ({ wch: w }));
  }

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "GSTR-1");

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename=\"Monthly_Tax_Report.xlsx\""
    }
  });
}
