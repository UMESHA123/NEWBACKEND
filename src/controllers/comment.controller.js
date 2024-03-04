import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {User} from "../models/user.model.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    const skip = (page-1) * limit;
    let comments = await Comment.find({video: videoId}).skip(skip).limit(limit);
    
    if(!comments){
        throw new ApiError(404, "Comments not found");
    }
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            comments,
            "Comments Retrieved",
        )
    )
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {content} = req.body;
    const {videoId} = req.params;

    if(!content){
        throw new ApiError(400, "Comment is required")
    }
    if(!videoId){
        throw new ApiError(500, "Something went wrong.");
    }

    const comment = await Comment.create({
        content: content,
        video: videoId,
        owner: req.user._id
    })

    if(!comment){
        throw new ApiError(500, "Something went wrong")
    }

    return res 
    .status(200)
    .json(
        new ApiResponse(
            200, 
            comment,
            "Comment created successfully",
        )
    )
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params;
    const {content} = req.body;
    
    if(!content){
        throw new ApiError(400, "Comment content is required.");
    }

    if(!commentId){
        throw new ApiError(500, "Something went wrong")
    }

    const comment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {content:content}
        },
        {
            new: true
        }
    )

    if(!comment){
        throw new ApiError(500, "Something went wrong")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            comment,
            "Comment updated successfully",
        )
    )
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params;
    
    if(!commentId){
        throw new ApiError(500, "Something went wrong")
    }
    const comment = await Comment.findByIdAndDelete(commentId)

    if(!comment){
        throw new ApiError(500, "Something went wrong")
    }

    return res 
    .status(200)
    .json(
        200,
        comment,
        "Commentd deleted successfully",
    )
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
    }
