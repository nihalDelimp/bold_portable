const mailer = require("../../helpers/nodemailer");
const sendSms = require("../../helpers/twillioSms.js");
const { server } = require('../../server');
const io = require('socket.io')(server);
const apiResponse = require("../../helpers/apiResponse");

exports.send = async (req, res) => {
	try {
		const { header, body } = req.body;

		const mailOptions = {
			from: process.env.MAIL_FROM,
			to: 'info@go-bold.ca',
			subject: header,
			text: body,
			html: `<html>
			   <body>
				 <p>Hi ${body}</p>
			   </body>
			 </html>`
		};

		mailer.sendMail(mailOptions);

		return apiResponse.successResponseWithData(
			res,
			"Mail sent successfully.",
		);
	} catch (error) {
		return apiResponse.ErrorResponse(res, error.message);
	}
};