const { expect } = require('chai');
const bookingHelper = require('../helpers/bookingHelper');
const testData = require('../../helpers/testData');

describe('GetBooking API', function () {
	it('should retrieve a created booking by id', async function () {
		const payload = {
			firstname: 'Alice',
			lastname: 'Smith',
			totalprice: 180,
			depositpaid: false,
			bookingdates: {
				checkin: testData.getFutureDate(2),
				checkout: testData.getFutureDate(6),
			},
			additionalneeds: 'Late checkout'
		};

		const createRes = await bookingHelper.createBooking(payload);
		expect(createRes.status).to.equal(200);
		const id = createRes.body.bookingid;

		const getRes = await bookingHelper.getBooking(id);
		expect(getRes.status).to.equal(200);
		const booking = getRes.body;
		expect(booking.firstname).to.equal(payload.firstname);
		expect(booking.lastname).to.equal(payload.lastname);
		expect(booking.totalprice).to.equal(payload.totalprice);
		expect(booking.depositpaid).to.equal(payload.depositpaid);
		expect(booking.bookingdates.checkin).to.equal(payload.bookingdates.checkin);
		expect(booking.bookingdates.checkout).to.equal(payload.bookingdates.checkout);
		expect(booking.additionalneeds).to.equal(payload.additionalneeds);
	});
});
