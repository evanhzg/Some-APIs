const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerDefinition = {
	openapi: '3.0.0',
	info: {
		title: 'Payment API',
		version: '1.0.0',
		description: 'Basic documentation UI for the Payment API',
	},
	servers: [
		{
			url: 'http://localhost:3000',
		},
	],
};

const options = {
	swaggerDefinition,
	apis: ['./app.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = (app) => {
	app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
