export function isCalendarDay(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value))
        return false;
    const date = new Date(value + 'T00:00:00.000Z');
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
export function validStay(checkIn, checkOut) {
    return isCalendarDay(checkIn) && isCalendarDay(checkOut) && checkIn < checkOut;
}
export function overlaps(existing, requested) {
    return existing.checkIn < requested.checkOut && existing.checkOut > requested.checkIn;
}
export function freeStaysWithin(requested, bookings) {
    const occupied = bookings
        .filter(booking => overlaps(booking, requested))
        .sort((a, b) => a.checkIn.localeCompare(b.checkIn));
    const free = [];
    let nextArrival = requested.checkIn;
    for (const booking of occupied) {
        if (nextArrival < booking.checkIn)
            free.push({ checkIn: nextArrival, checkOut: booking.checkIn });
        if (nextArrival < booking.checkOut)
            nextArrival = booking.checkOut;
    }
    if (nextArrival < requested.checkOut)
        free.push({ checkIn: nextArrival, checkOut: requested.checkOut });
    return free;
}
