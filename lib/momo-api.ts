export async function requestToPay(
    amount: number,
    currency: string,
    phoneNumber: string,
    payerMessage: string,
    payeeNote: string,
  ) {
    const response = await fetch("/api/momo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        currency,
        phoneNumber,
        payerMessage,
        payeeNote,
      }),
    })
  
    if (!response.ok) {
      throw new Error("Failed to initiate payment request")
    }
  
    return await response.json()
  }
  
  export async function getPaymentStatus(referenceId: string) {
    const response = await fetch(`/api/momo?referenceId=${referenceId}`)
  
    if (!response.ok) {
      throw new Error("Failed to get payment status")
    }
  
    return await response.json()
  }
  
  