import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AuctionHistory, Product } from "@/lib/models";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { productId, paymentType } = body;

    if (!productId || !paymentType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!["full", "penalty"].includes(paymentType)) {
      return NextResponse.json(
        { error: "Invalid payment type" },
        { status: 400 }
      );
    }

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const normalizedWinnerEmail = product.highestBidderEmail?.trim().toLowerCase() || "";
    const normalizedSessionEmail = session.user.email?.trim().toLowerCase() || "";
    if (!normalizedWinnerEmail || normalizedWinnerEmail !== normalizedSessionEmail) {
      return NextResponse.json(
        { error: "Only the auction winner can complete this payment" },
        { status: 403 }
      );
    }

    const fullPaymentExists = await AuctionHistory.existsByProductAndPayment(productId, "full");
    const penaltyPaymentExists = await AuctionHistory.existsByProductAndPayment(productId, "penalty");

    if (fullPaymentExists) {
      return NextResponse.json({
        success: true,
        message: "This auction is already fully completed.",
      });
    }

    if (paymentType === "full" && penaltyPaymentExists) {
      return NextResponse.json(
        { error: "This auction already has a penalty payment and cannot be fully paid now." },
        { status: 409 }
      );
    }

    // Idempotency guard for repeated success-page or webhook retries.
    const alreadyRecorded =
      paymentType === "full" ? fullPaymentExists : penaltyPaymentExists;

    if (!alreadyRecorded) {
      await AuctionHistory.create({
        productId,
        productTitle: product.title,
        productImageUrl: product.imageUrl,
        productCategory: product.category || null,
        sellerUserId: product.userId || null,
        sellerEmail: product.userEmail || null,
        conductedAt: new Date(),
        auctionEndTime: product.auctionEndTime || null,
        winnerUserId: product.highestBidder || session.user.id || null,
        winnerEmail: product.highestBidderEmail || session.user.email || null,
        winningBidAmount: product.currentBid || 0,
        paymentType,
        outcomeStatus: paymentType === "penalty" ? "penalty_paid" : "completed",
      });
    }


    // If penalty was paid, reactivate the product for re-listing
    if (paymentType === "penalty") {
      // Reset auction status to allow seller to re-list
      await Product.findByIdAndUpdate(productId, {
        auctionStatus: 'none',
        hasAuction: false,
        isActive: true,
        auctionEndTime: null,
        currentBid: product.startingBid || 0,
        totalBids: 0,
        highestBidderEmail: null,
        highestBidder: null
      });

      return NextResponse.json({
        success: true,
        message: "Product reactivated for re-listing after penalty payment",
      });
    }

    // For full payment, mark as sold
    if (paymentType === "full") {
      await Product.findByIdAndUpdate(productId, {
        auctionStatus: 'ended',
        hasAuction: false,
        isActive: false
      });

      return NextResponse.json({
        success: true,
        message: "Product marked as sold",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Payment processed",
    });
  } catch (error: unknown) {
    console.error("Process payment error:", error);
    const message = error instanceof Error ? error.message : "Failed to process payment completion"
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
