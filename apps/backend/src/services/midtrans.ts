/**
 * Midtrans Snap API integration service
 * Handles payment transaction creation and status checking
 */

interface MidtransTransactionRequest {
  transaction_details: {
    order_id: string
    gross_amount: number
  }
  customer_details?: {
    first_name: string
    email: string
    phone: string
  }
  item_details?: Array<{
    id: string
    price: number
    quantity: number
    name: string
  }>
  callbacks?: {
    finish?: string
    error?: string
    unfinish?: string
  }
  notification_url?: string
}

interface MidtransTransactionResponse {
  token: string
  redirect_url: string
}

interface MidtransStatusResponse {
  transaction_id: string
  order_id: string
  transaction_status: string
  fraud_status: string
  status_code: string
  gross_amount: string
}

const getServerKey = () => {
  const key = process.env.MIDTRANS_SERVER_KEY
  if (!key) {
    throw new Error('MIDTRANS_SERVER_KEY environment variable is not set')
  }
  return key
}

const getBaseUrl = () => {
  return process.env.MIDTRANS_BASE_URL || 'https://app.sandbox.midtrans.com'
}

const getAuthHeader = () => {
  const serverKey = getServerKey()
  const encoded = Buffer.from(`${serverKey}:`).toString('base64')
  return `Basic ${encoded}`
}

/**
 * Create a Midtrans Snap transaction
 * @param transactionData - Transaction details
 * @returns Snap token and redirect URL
 */
export const createSnapToken = async (
  transactionData: MidtransTransactionRequest
): Promise<MidtransTransactionResponse> => {
  const baseUrl = getBaseUrl()
  const url = `${baseUrl}/snap/v1/transactions`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: getAuthHeader(),
    },
    body: JSON.stringify(transactionData),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Midtrans API error: ${response.status} ${response.statusText} - ${errorText}`)
  }

  return response.json() as Promise<MidtransTransactionResponse>
}

/**
 * Check transaction status from Midtrans
 * @param orderId - Order ID to check
 * @returns Transaction status details
 */
export const checkStatus = async (orderId: string): Promise<MidtransStatusResponse> => {
  const baseUrl = getBaseUrl()
  const url = `${baseUrl}/snap/v1/transactions/${orderId}/status`

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: getAuthHeader(),
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Midtrans API error: ${response.status} ${response.statusText} - ${errorText}`)
  }

  return response.json() as Promise<MidtransStatusResponse>
}
