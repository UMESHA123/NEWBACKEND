import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"

const toggleLike = async (modelName, id, userId) => {
    try{
        const existingLike = await Like.findOne(
            {
                [modelName]: id,
                likedBy: userId
            }
        )
        if(existingLike){
            await Like.findByIdAndDelete(existingLike._id)
            return new ApiResponse(200, "Like removed successfully")
        }else{
            await Like.create(
                {
                    [modelName]: id,
                    likedBy: userId
                }
            )
            return new ApiResponse(200, "Like added")
        }
    }catch(error){
        throw new ApiError(500, error?.message || "something went wrong")
    }
}

const likeStatus = async (modelName, id, userId) => {
    try{
        const existingLike = await Like.findOne(
            {
                [modelName]: id,
                likedBy: userId
            }
        )
        if(existingLike){
            
            return new ApiResponse(200, {isLiked: true},"like status featched successfuly")
        }else{
            
            return new ApiResponse(200,{isLiked: false}, "like status featched successfuly")
        }
    }catch(error){
        throw new ApiError(500, error?.message || "something went wrong")
    }
}
const getVideoLikeStatus = asyncHandler( async (req, res) => {
    const {videoId} = req.params
   
    const videoLikeStatus = await likeStatus("video", videoId, req.user._id)

    return res
    .status(200)
    .json(
        videoLikeStatus
    )
})
const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    const videoLikeResult = await toggleLike("video", videoId, req.user._id)

    return res
    .status(200)
    .json(
        videoLikeResult
    )
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    const commentLikeResult = await toggleLike("comment", commentId, req.user._id)
   
    return res
    .status(200)
    .json(
        ApiResponse(
            200,
            commentLikeResult,
            "Liked successfully"
        )
    )
})
const getCommentLikeStatus = asyncHandler( async (req, res) => {
    const {commentId} = req.params
   
    const commentLikeStatus = await likeStatus("comment", commentId, req.user._id)

    return res
    .status(200)
    .json(
        commentLikeStatus
    )
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    const  tweetLikeResult = await toggleLike("tweet", tweetId, req.user._id)
    
    return res
    .status(200)
    .json(
        ApiResponse(
            200,
            tweetLikeResult,
            "Liked successfully"
        )
    )
})
const getTweetLikeStatus = asyncHandler( async (req, res) => {
    const {tweetId} = req.params
   
    const tweetLikeStatus = await likeStatus("tweet", tweetId, req.user._id)

    return res
    .status(200)
    .json(
        tweetLikeStatus
    )
})

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const likedVideos = await Like.find(
        {
            likedBy: req.user._id
        }
    ).populate("video")
    if(!likedVideos){
        throw new ApiError(404, "No liked videos found")
    }
    let filteredRes = likedVideos.map((likedVideo) => likedVideo.video?likedVideo:null);
    filteredRes = filteredRes.filter(item => item !== null);

    for(let i=0;i<filteredRes.length;i++) {
        let ownerDetailes = await User.findById(filteredRes[i].video.owner);
        filteredRes[i].video.owner = ownerDetailes;
    }

    return res 
    .status(200)
    .json(
        new ApiResponse(
            200, 
            filteredRes,
            "Liked Videos"
        )
    )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos,
    getVideoLikeStatus,
    getTweetLikeStatus,
    getCommentLikeStatus
}
