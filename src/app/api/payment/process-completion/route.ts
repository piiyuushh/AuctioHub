import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
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

    await connectDB();

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
      product.auctionActive = false;
      product.auctionEndTime = null;
      product.currentBid = product.startingPrice;
      product.bidCount = 0;
      product.highestBidderEmail = null;
      
      // Mark that a penalty was paid (for record keeping)
      product.penaltyPaid = true;
      product.penaltyPaidBy = product.highestBidderEmail;
      product.penaltyPaidAt = new Date();
      
      await product.save();

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

      product.status = "sold";
      product.auctionActive = false;
      product.soldAt = new Date();
      
      await product.save();

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
