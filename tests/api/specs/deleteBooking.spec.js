const { expect } = require('chai');
const bookingHelper = require('../helpers/bookingHelper');
const authHelper = require('../helpers/authHelper');
const testData = require('../../helpers/testData');

describe('DeleteBooking API', function () {
	it('should delete a booking when authenticated and return 404 afterwards', async function () {
		const payload = {
			firstname: 'Eve',
			lastname: 'Green',
			totalprice: 300,
			depositpaid: true,
			bookingdates: {
				checkin: testData.getFutureDate(4),
				checkout: testData.getFutureDate(8),
			},
			additionalneeds: 'Dinner'
		};

		const createRes = await bookingHelper.createBooking(payload);
		expect(createRes.status).to.equal(200);
		const id = createRes.body.bookingid;

		const token = await authHelper.getAuthToken();
		const delRes = await bookingHelper.deleteBooking(id, token);
		expect([200,201,204]).to.include(delRes.status);

		const getRes = await bookingHelper.getBooking(id);
		expect(getRes.status).to.equal(404);
	});
});
