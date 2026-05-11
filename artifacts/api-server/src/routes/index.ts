import { Router, type IRouter } from "express";
import healthRouter from "./health";
import tipsRouter from "./tips";
import subscribersRouter from "./subscribers";

const router: IRouter = Router();

router.use(healthRouter);
router.use(tipsRouter);
router.use(subscribersRouter);

export default router;
