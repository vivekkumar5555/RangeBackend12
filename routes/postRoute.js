import { Router } from "express";
import { PostLeadVerification } from "../controllers/PostLeadVerification.js";

export const postRouter = Router();

postRouter.post("/leadVerification",PostLeadVerification);