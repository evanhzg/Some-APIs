const express = require('express');
const pool = require('./database');
const swagger = require('./swagger');

const app = express();

swagger(app);

app.listen(3000, () => {
	console.log('Server is running on port 3000');
});
