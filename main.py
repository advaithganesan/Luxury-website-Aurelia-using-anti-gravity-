from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import asyncio
import time

app = FastAPI(title="AURELIA API", version="1.0.0")

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the actual domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Models
class CartItem(BaseModel):
    id: int
    quantity: int

class PaymentRequest(BaseModel):
    cart: list[CartItem]
    total_amount: float
    customer_name: str
    email: str

class ChatRequest(BaseModel):
    message: str

class ContactRequest(BaseModel):
    name: str
    email: str
    inquiry: str

# Endpoints
@app.get("/products")
async def get_products():
    return [
        {
            "id": 1,
            "name": "Obsidian Leather Tote",
            "price": 1250.00,
            "imageURL": "assets/handbag.png",
            "description": "Handcrafted from the finest Italian calfskin with champagne gold hardware."
        },
        {
            "id": 2,
            "name": "Silk Moiré Scarf",
            "price": 345.00,
            "imageURL": "assets/scarf.png",
            "description": "Pure Mulberry silk featuring our signature abstract monogram."
        },
        {
            "id": 3,
            "name": "Cashmere Wrap Coat",
            "price": 2890.00,
            "imageURL": "assets/coat.png",
            "description": "Sourced from the highlands of Mongolia, an ultra-soft timeless piece."
        },
        {
            "id": 4,
            "name": "Aurelia Chronograph",
            "price": 4500.00,
            "imageURL": "assets/watch.png",
            "description": "18k Champagne gold plating with a minimalist obsidian dial."
        }
    ]

@app.post("/process-payment")
async def process_payment(payment: PaymentRequest):
    # Simulate a 2-second payment processing delay
    await asyncio.sleep(2)
    return {"status": "success", "message": "Payment Successful", "transaction_id": f"TXN-{int(time.time())}"}

@app.post("/chat")
async def chat(request: ChatRequest):
    msg = request.message.lower()
    response = "Welcome to AURELIA. How may I assist you with your styling needs today?"
    
    if "material" in msg or "fabric" in msg or "leather" in msg:
        response = "At AURELIA, we pride ourselves on uncompromising quality. Our collections feature Italian calfskin, pure Mulberry silk, and hand-sourced Mongolian cashmere."
    elif "shipping" in msg or "delivery" in msg:
        response = "We offer complimentary express shipping worldwide on all orders. Your luxury items will arrive impeccably packaged."
    elif "price" in msg or "cost" in msg:
        response = "Our pricing reflects the extraordinary craftsmanship and rare materials used in each piece. May I help you find something specific?"
    elif "return" in msg:
        response = "We accept returns within 30 days. The item must be in pristine condition with all AURELIA tags attached."
    elif "hello" in msg or "hi" in msg:
        response = "Greetings. I am your personal AURELIA concierge. How can I curate your experience today?"
        
    return {"response": response}

@app.post("/contact-submit")
async def contact_submit(request: ContactRequest):
    # In a real app, this would send an email or save to a database
    return {"status": "success", "message": "Thank you for your inquiry. An AURELIA representative will contact you shortly."}

# Mount the frontend directory to serve static HTML/CSS/JS files
app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")
