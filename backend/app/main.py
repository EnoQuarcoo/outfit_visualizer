from fastapi import FastAPI
from app.routes import subscribers
from fastapi.middleware.cors import CORSMiddleware
from app.routes import subscribers, tryon, clothes, upload


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "https://outfit-visualizer-git-development-enoquarcoos-projects.vercel.app",
        "https://outfit-visualizer.vercel.app",
        "https://abrima.fit",
        "https://www.abrima.fit",
        "https://abrima-testing.vercel.app",
        "https://app.abrima.fit"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Outfit Visualizer APP built by a baddie"}

app.include_router(subscribers.router)
app.include_router(tryon.router)
app.include_router(clothes.router)
app.include_router(upload.router)
