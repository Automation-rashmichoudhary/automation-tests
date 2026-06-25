import { expect } from 'chai';
import bookingHelper from '../helpers/bookingHelper.js';
import testData from '../../helpers/testData.js';

describe('CreateBooking API', function () {
	it('should create a booking and return booking details', async function () {
		const payload = {
			firstname: 'John',
			lastname: 'Doe',
			totalprice: 250,
			depositpaid: true,
			bookingdates: {
				checkin: testData.getFutureDate(1),
				checkout: testData.getFutureDate(5),
			},
			additionalneeds: 'Breakfast'
		};

		const res = await bookingHelper.createBooking(payload);
		expect(res.status).to.equal(200);
		expect(res.body).to.have.property('bookingid');
		expect(res.body).to.have.property('booking');
		const booking = res.body.booking;
		expect(booking.firstname).to.equal(payload.firstname);
		expect(booking.lastname).to.equal(payload.lastname);
		expect(booking.totalprice).to.equal(payload.totalprice);
		expect(booking.depositpaid).to.equal(payload.depositpaid);
		expect(booking.bookingdates.checkin).to.equal(payload.bookingdates.checkin);
		expect(booking.bookingdates.checkout).to.equal(payload.bookingdates.checkout);
		expect(booking.additionalneeds).to.equal(payload.additionalneeds);
	});
});
