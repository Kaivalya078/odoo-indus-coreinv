from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, categories, products, suppliers

app = FastAPI(
    title="CoreINV — Inventory Management System",
    version="1.0.0",
    description="Production-grade multi-warehouse inventory management API",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(categories.router)
app.include_router(products.router)
app.include_router(suppliers.router)


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "coreinv"}

