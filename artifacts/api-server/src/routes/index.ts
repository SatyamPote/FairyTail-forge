import { Router, type IRouter } from "express";
import healthRouter from "./health";
import comicRouter from "./comic";

const router: IRouter = Router();

router.use(healthRouter);
router.use(comicRouter);

export default router;
