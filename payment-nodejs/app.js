const express = require('express');
const pool = require('./database');
const swagger = require('./swagger');

const app = express();

swagger(app);

/**
 * @swagger
 * /payments:
 *   get:
 *     summary: Get all payments
 *     responses:
 *       200:
 *         description: Successfully retrieved payments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   user_id:
 *                     type: integer
 *                   amount:
 *                     type: number
 *                   currency:
 *                     type: string
 *                   payment_date:
 *                     type: string
 *                     format: date-time
 */
app.get('/payments', async (req, res) => {
	try {
		const result = await pool.query('SELECT * FROM payments');
		if (result.rows.length === 0) {
			return res.status(204).send();
		}
		res.status(200).json(result.rows);
	} catch (err) {
		console.error(err);
		res.status(500).send('Internal Server Error');
	}
});

/**
 * @swagger
 * /payments/{id}:
 *   get:
 *     summary: Get a payment by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the payment to retrieve
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully retrieved payment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 user_id:
 *                   type: integer
 *                 amount:
 *                   type: number
 *                 currency:
 *                   type: string
 *                 payment_date:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Payment not found
 */
app.get('/payments/:id', async (req, res) => {
	const { id } = req.params;
	try {
		const result = await pool.query(
			'SELECT * FROM payments WHERE id = $1 AND is_active = true',
			[id]
		);
		if (result.rows.length === 0) {
			return res.status(404).send('Payment not found');
		}
		res.status(200).json(result.rows[0]);
	} catch (err) {
		console.error(err);
		res.status(500).send('Internal Server Error');
	}
});

/**
 * @swagger
 * /payments:
 *   post:
 *     summary: Add a new payment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *               amount:
 *                 type: number
 *               currency:
 *                 type: string
 *               payment_date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Successfully created payment
 *       400:
 *         description: Invalid input
 */
app.post('/payments', async (req, res) => {
	const { user_id, amount, currency, payment_date } = req.body;
	try {
		const result = await pool.query(
			'INSERT INTO payments (user_id, amount, currency, payment_date, is_active) VALUES ($1, $2, $3, $4, true) RETURNING *',
			[user_id, amount, currency, payment_date]
		);
		res.status(201).json(result.rows[0]);
	} catch (err) {
		console.error(err);
		res.status(400).send('Invalid input');
	}
});

/**
 * @swagger
 * /payments/{id}:
 *   put:
 *     summary: Edit an existing payment
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the payment to update
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *               amount:
 *                 type: number
 *               currency:
 *                 type: string
 *               payment_date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Successfully updated payment
 *       404:
 *         description: Payment not found
 */
app.put('/payments/:id', async (req, res) => {
	const { id } = req.params;
	const { user_id, amount, currency, payment_date } = req.body;
	try {
		const result = await pool.query(
			'UPDATE payments SET user_id = $1, amount = $2, currency = $3, payment_date = $4 WHERE id = $5 AND is_active = true RETURNING *',
			[user_id, amount, currency, payment_date, id]
		);
		if (result.rows.length === 0) {
			return res.status(404).send('Payment not found');
		}
		res.status(200).json(result.rows[0]);
	} catch (err) {
		console.error(err);
		res.status(400).send('Invalid input');
	}
});

/**
 * @swagger
 * /payments/{id}:
 *   delete:
 *     summary: Soft delete a payment by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the payment to delete
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Successfully deleted payment
 *       404:
 *         description: Payment not found
 */
app.delete('/payments/:id', async (req, res) => {
	const { id } = req.params;
	try {
		const result = await pool.query(
			'UPDATE payments SET is_active = false WHERE id = $1 RETURNING *',
			[id]
		);
		if (result.rows.length === 0) {
			return res.status(404).send('Payment not found');
		}
		res.status(204).send();
	} catch (err) {
		console.error(err);
		res.status(500).send('Internal Server Error');
	}
});

app.listen(3000, () => {
	console.log('Server is running on port 3000');
});
