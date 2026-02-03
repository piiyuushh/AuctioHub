import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/database";
import { Product } from "@/lib/models";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, paymentType } = body;

    if (!productId || !paymentType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }


    // If penalty was paid, reactivate the product for re-listing
    if (paymentType === "penalty") {
      const product = await Product.findById(productId);
      
      if (!product) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 }
        );
      }

      // Reset auction status to allow seller to re-list
      await Product.findByIdAndUpdate(productId, {
        auctionStatus: 'none',
        hasAuction: false,
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
      const product = await Product.findById(productId);
      
      if (!product) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 }
        );
      }

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
  } catch (error: any) {
    console.error("Process payment error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process payment completion" },
      { status: 500 }
    );
  }
}
