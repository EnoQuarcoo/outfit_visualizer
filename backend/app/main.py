from fastapi import FastAPI
from app.routes import subscribers
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for now (we’ll tighten later)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Outfit Visualizer APP built by a baddie"}

app.include_router(subscribers.router)
