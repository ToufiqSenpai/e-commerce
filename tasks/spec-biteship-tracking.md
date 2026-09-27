# Spec: Biteship Order Tracking (Testing Only)

## Objective

Membuat integrasi Biteship untuk membuat shipment otomatis saat pembayaran sukses dan menyediakan endpoint tracking. Ini adalah testing-only — validasi flow Biteship di staging sebelum commit ke production.

## Assumptions

1. Biteship API key sudah ada di env (sudah dipakai di shipping service)
2. Biteship staging mode: order terbuat tapi courier tidak pickup secara real
3. Origin data (toko) sudah hardcoded di shipping service → gunakan yang sama
4. Address Strapi sudah punya `latitude`/`longitude` (dari `address` model)
5. Shipping JSON di order sudah berisi `courierId`, `courierName`, `serviceId`, `serviceName`

## Commands

```
Build:     npm run build
Dev:       npm run dev
Typecheck: npx tsc --noEmit
Test:      manual — buat order, bayar via Midtrans sandbox, cek Biteship staging dashboard
```

## Project Structure

```
apps/backend/src/
├── api/order/
│   ├── content-types/order/schema.json     ← tambah biteshipOrderId, waybillId
│   ├── controllers/order.ts                ← tambah action: tracking
│   ├── routes/order.ts                     ← tambah route: GET /orders/:id/tracking
│   └── services/order.ts                   ← tambah: createBiteshipOrder(), getTracking()
├── services/
│   └── biteship.ts                         ← new: createOrder(), getTracking()
```

## Code Style

Mengikuti pola yang sudah ada di `apps/backend/src/api/shipping/services/shipping.ts`:

```typescript
// Direct fetch, no wrapper libraries
const response = await fetch(`${BASE_URL}/v1/orders`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  },
  body: JSON.stringify(payload),
})
if (!response.ok) {
  const errorBody = await response.text()
  throw new Error(`Biteship API error: ${response.status} — ${errorBody}`)
}
```

## Schema Changes

Tambah field di `order/content-types/order/schema.json`:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `biteshipOrderId` | string | false | ID order di Biteship (response dari POST /v1/orders) |
| `waybillId` | string | false | Nomor waybill dari Biteship |

`midtransSnapToken` bisa tetap ada atau dihapus — tidak dipakai lagi untuk redirect flow. Terserah, untuk testing biarkan saja.

## API Endpoints

### 1. POST /api/orders/:id/shipment (internal/manual trigger)

**Purpose**: Buat Biteship shipment dari order yang sudah bayar.

**Input**: `documentId` dari order (via URL param)

**Logic**:
1. Fetch order dari Strapi (populate `address` dan user)
2. Validate order exists dan `orderStatus === 'paid'`
3. Build payload Biteship dari order data:
   - Origin: hardcoded (sama seperti di shipping service: `-6.1751, 106.8650`)
   - Destination: dari `address.latitude`, `address.longitude`, `address.recipientName`, `address.phone`, `address.streetAddress`
   - Courier: dari `order.shipping.courierId`, `order.shipping.serviceId`
   - Items: dari `order.items` (array)
4. Call `POST /v1/orders` ke Biteship
5. Simpan `biteshipOrderId` (response.id) dan `waybillId` (response.courier.waybill_id) ke order
6. Return response Biteship

**Why manual trigger?** Untuk testing. Di production nanti, trigger-nya dari Midtrans webhook.

### 2. GET /api/orders/:id/tracking

**Purpose**: Cek status tracking dari Biteship.

**Logic**:
1. Fetch order dari Strapi
2. Jika `biteshipOrderId` tidak ada → return error "Shipment not created yet"
3. Call `GET /v1/trackings/:biteshipOrderId`
4. Return status + courier history

**Response shape:**
```json
{
  "status": "in_transit",
  "courier": {
    "company": "jne",
    "waybill_id": "JNE-123456",
    "tracking_id": "...",
    "history": [
      { "status": "confirmed", "note": "...", "updated_at": "..." },
      { "status": "allocated", "note": "...", "updated_at": "..." },
      ...
    ]
  }
}
```

## Biteship Payload Mapping

| Field | Source |
|-------|--------|
| `origin_contact_name` | Hardcoded (nama toko) |
| `origin_contact_phone` | Hardcoded (phone toko) |
| `origin_address` | Hardcoded (alamat toko) |
| `origin_coordinate.latitude` | `-6.1751` (sama seperti shipping service) |
| `origin_coordinate.longitude` | `106.8650` |
| `destination_contact_name` | `address.recipientName` |
| `destination_contact_phone` | `address.phone` |
| `destination_address` | `address.streetAddress` |
| `destination_coordinate.latitude` | `address.latitude` |
| `destination_coordinate.longitude` | `address.longitude` |
| `courier_company` | `order.shipping.courierId` (jne/jnt/sicepat) |
| `courier_type` | `order.shipping.serviceId` (reg/oke/yes/ etc.) |
| `delivery_type` | `"now"` |
| `items` | `order.items` → map ke format Biteship (name, value, quantity, weight) |
| `reference_id` | `order.midtransOrderId` (unique identifier) |

## Biteship Status Mapping (untuk reference)

```
confirmed → allocated → picking_up → picked → in_transit → dropping_off → delivered
```

Edge cases: `courier_not_found`, `on_hold`, `returned`, `cancelled`, `disposed`

## Boundaries

- **Always**: Validate order exists dan status `paid` sebelum create shipment; use `reference_id` agar tidak duplicate
- **Ask first**: Schema changes (tambah field di order), hapus `midtransSnapToken`
- **Never**: Buat shipment untuk order yang belum bayar

## Success Criteria

1. `POST /api/orders/:id/shipment` berhasil create order di Biteship staging
2. Response Biteship mengembalikan `id` dan `waybill_id` yang tersimpan di Strapi
3. `GET /api/orders/:id/tracking` mengembalikan status + history dari Biteship
4. Bisa ganti status di Biteship staging dashboard, lalu cek perubahan via tracking endpoint

## Open Questions

1. Perlu tambah field `latitude`/`longitude` di Strapi address schema? → Perlu cek dulu apakah sudah ada
2. Items di Biteship butuh `weight` dalam gram — apakah `product.weight` sudah dalam gram? → Sudah (1000 default di shipping service)
