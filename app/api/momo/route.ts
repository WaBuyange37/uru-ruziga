import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"

const API_BASE_URL = "https://sandbox.momodeveloper.mtn.com/collection"
const API_KEY = process.env.MTN_MOMO_API_KEY
const SUBSCRIPTION_KEY = process.env.MTN_MOMO_SUBSCRIPTION_KEY

export async function POST(request: Request) {
  const { amount, currency, phoneNumber, payerMessage, payeeNote } = await request.json()

  const referenceId = uuidv4()

  try {
    const response = await fetch(`${API_BASE_URL}/v1_0/requesttopay`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "X-Reference-Id": referenceId,
        "X-Target-Environment": "sandbox",
        "Ocp-Apim-Subscription-Key": SUBSCRIPTION_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amount.toString(),
        currency,
        externalId: referenceId,
        payer: {
          partyIdType: "MSISDN",
          partyId: phoneNumber,
        },
        payerMessage,
        payeeNote,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to initiate payment request")
    }

    return NextResponse.json({ referenceId })
  } catch (error) {
    console.error("Error processing payment:", error)
    return NextResponse.json({ error: "Failed to process payment" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const referenceId = searchParams.get("referenceId")

  if (!referenceId) {
    return NextResponse.json({ error: "Reference ID is required" }, { status: 400 })
  }

  try {
    const response = await fetch(`${API_BASE_URL}/v1_0/requesttopay/${referenceId}`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "X-Target-Environment": "sandbox",
        "Ocp-Apim-Subscription-Key": SUBSCRIPTION_KEY!,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to get payment status")
    }

    const paymentStatus = await response.json()
    return NextResponse.json(paymentStatus)
  } catch (error) {
    console.error("Error getting payment status:", error)
    return NextResponse.json({ error: "Failed to get payment status" }, { status: 500 })
  }
}

