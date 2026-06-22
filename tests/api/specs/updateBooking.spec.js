const { expect } = require('chai');
const bookingHelper = require('../helpers/bookingHelper');
const authHelper = require('../helpers/authHelper');
const testData = require('../../helpers/testData');

describe('UpdateBooking API', function () {
	it('should update an existing booking when authenticated', async function () {
		const initial = {
			firstname: 'Bob',
			lastname: 'Brown',
			totalprice: 120,
			depositpaid: false,
			bookingdates: {
				checkin: testData.getFutureDate(3),
				checkout: testData.getFutureDate(7),
			},
			additionalneeds: 'None'
		};

		const createRes = await bookingHelper.createBooking(initial);
		expect(createRes.status).to.equal(200);
		const id = createRes.body.bookingid;

		const token = await authHelper.getAuthToken();

		const updated = Object.assign({}, initial, { firstname: 'Robert', totalprice: 200, additionalneeds: 'Breakfast' });

		const updateRes = await bookingHelper.updateBooking(id, updated, token);
		expect(updateRes.status).to.equal(200);
		const booking = updateRes.body;
		expect(booking.firstname).to.equal(updated.firstname);
		expect(booking.totalprice).to.equal(updated.totalprice);
		expect(booking.additionalneeds).to.equal(updated.additionalneeds);
	});
});
