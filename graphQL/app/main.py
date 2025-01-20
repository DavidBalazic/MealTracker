from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn as uvicorn
import strawberry
from strawberry.fastapi import GraphQLRouter
from app.routes.resolvers import Query, Mutation

schema = strawberry.Schema(query=Query, mutation=Mutation)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"], 
)

app.include_router(GraphQLRouter(schema), prefix="/graphql")

if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=8000)