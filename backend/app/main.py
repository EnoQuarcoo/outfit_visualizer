from fastapi import FastAPI

app = FastAPI(title="Outfit Visualizer API")

@app.get("/")
async def root():
    return {"message": "Outfit Visualizer APP built by a baddie"}

