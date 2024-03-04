import { Router } from 'express';
import {
    getLikedVideos,
    toggleCommentLike,
    toggleVideoLike,
    toggleTweetLike,
    getVideoLikeStatus,
    getTweetLikeStatus,
    getCommentLikeStatus,
} from "../controllers/like.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/toggle/v/:videoId").post(toggleVideoLike);
router.route("/toggle/c/:commentId").post(toggleCommentLike);
router.route("/toggle/t/:tweetId").post(toggleTweetLike);
router.route("/videos").get(getLikedVideos);
router.route("/video/like/s/:videoId").get(getVideoLikeStatus);
router.route("/tweet/like/s/:tweetId").get(getTweetLikeStatus);
router.route("/comment/like/s/:commentId").get(getCommentLikeStatus);
export default router
