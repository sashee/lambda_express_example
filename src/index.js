const crypto = require("crypto");
const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient();
const serverless = require("serverless-http");
const express = require("express");
const bodyParser = require("body-parser");
const asyncHandler = require("express-async-handler");

const app = express();
app.use(bodyParser.json());

const router = express.Router();

router.get("/user", asyncHandler(async (req, res) => {
	const items = await docClient.scan({
		TableName: process.env.TABLE,
	}).promise();

	res.json(items.Items);
}));

router.post("/user", asyncHandler(async (req, res) => {
	const user = req.body;
	const userid = crypto.randomBytes(16).toString("hex");

	await docClient.put({
		TableName: process.env.TABLE,
		Item: {
			...user,
			userid,
		},
	}).promise();
	
	res.json({userid});
}));

router.get("/user/:userid", asyncHandler(async (req, res) => {
	const userid = req.params.userid;

	const user = await docClient.get({
		TableName: process.env.TABLE,
		Key: {userid},
	}).promise();

	res.json(user.Item);
}));

router.put("/user/:userid", asyncHandler(async (req, res) => {
	const userid = req.params.userid;
	const user = req.body;

	await docClient.put({
		TableName: process.env.TABLE,
		Item: {
			...user,
			userid,
		},
	}).promise();

	res.json({status: "OK"});
}));

router.delete("/user/:userid", asyncHandler(async (req, res) => {
	const userid = req.params.userid;

	await docClient.delete({
		TableName: process.env.TABLE,
		Key: {userid},
	}).promise();

	res.json({status: "OK"});
}));

app.use("/", router);

module.exports.handler = serverless(app);
