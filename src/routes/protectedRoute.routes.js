import { Router } from "express";
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();
router.use(verifyJWT);

router.route("/").get( (req, res) => {
    return res.status(200).send({ok: true})
});

export default router