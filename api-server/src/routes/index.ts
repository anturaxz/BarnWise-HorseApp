import { Router, type IRouter } from "express";
import healthRouter from "./health";
import barnwiseRouter from "./barnwise";

const router: IRouter = Router();

router.use(healthRouter);
router.use(barnwiseRouter);

export default router;
