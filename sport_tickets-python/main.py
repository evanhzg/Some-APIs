from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import psycopg2
from psycopg2.extras import RealDictCursor

app = FastAPI()

def get_db_connection():
    conn = psycopg2.connect(
        host="localhost",
        database="ticketing",
        user="tickets_user",
        password="admin"
    )
    return conn

class Ticket(BaseModel):
    id: int
    event_name: str
    user_id: int
    amount: float
    ticket_date: str

class TicketCreate(BaseModel):
    event_name: str
    user_id: int
    amount: float
    ticket_date: str

@app.get("/tickets", response_model=List[Ticket])
async def read_tickets():
    conn = get_db_connection()
    with conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("SELECT * FROM tickets WHERE is_active = true;")
            tickets = cursor.fetchall()
    return tickets

@app.get("/tickets/{ticket_id}", response_model=Ticket)
async def read_ticket(ticket_id: int):
    conn = get_db_connection()
    with conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("SELECT * FROM tickets WHERE id = %s AND is_active = true;", (ticket_id,))
            ticket = cursor.fetchone()
            if ticket is None:
                raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket

@app.post("/tickets", response_model=Ticket)
async def create_ticket(ticket: TicketCreate):
    conn = get_db_connection()
    with conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(
                "INSERT INTO tickets (event_name, user_id, amount, ticket_date, is_active) VALUES (%s, %s, %s, %s, true) RETURNING *;",
                (ticket.event_name, ticket.user_id, ticket.amount, ticket.ticket_date)
            )
            new_ticket = cursor.fetchone()
    return new_ticket

@app.put("/tickets/{ticket_id}", response_model=Ticket)
async def update_ticket(ticket_id: int, ticket: TicketCreate):
    conn = get_db_connection()
    with conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(
                "UPDATE tickets SET event_name = %s, user_id = %s, amount = %s, ticket_date = %s WHERE id = %s AND is_active = true RETURNING *;",
                (ticket.event_name, ticket.user_id, ticket.amount, ticket.ticket_date, ticket_id)
            )
            updated_ticket = cursor.fetchone()
            if updated_ticket is None:
                raise HTTPException(status_code=404, detail="Ticket not found")
    return updated_ticket

@app.delete("/tickets/{ticket_id}", status_code=204)
async def delete_ticket(ticket_id: int):
    conn = get_db_connection()
    with conn:
        with conn.cursor() as cursor:
            cursor.execute("UPDATE tickets SET is_active = false WHERE id = %s;", (ticket_id,))
            if cursor.rowcount == 0:
                raise HTTPException(status_code=404, detail="Ticket not found")