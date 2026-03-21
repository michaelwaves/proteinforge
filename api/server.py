from dataclasses import dataclass
from fastapi import FastAPI
@dataclass
class GenerateRequest:
    prompt: str
    pdb: str | None #for optional scaffolding, pdb motif from a protein database








