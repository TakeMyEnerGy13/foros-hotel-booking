import { saveBooking } from '@/lib/booking-service'

export async function POST(request: Request) {
  return saveBooking(request, false)
}
