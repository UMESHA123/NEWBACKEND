import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content} = req.body;
    const userId = req.user._id;

    if(!userId){
        throw new ApiError(400, "user not found")
    }
    const tweet = await Tweet.create({content: content, owner: userId});
    if(!tweet){
        throw new ApiError(500, "Something went wrong while creating a tweet")
    }
    return res 
    .status(200)
    .json(
        new ApiResponse(
            200,
            tweet,
            "Tweet created successfully"
        )
    )
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {userId} = req.params;
    const tweets = await Tweet.find({owner: userId})
    return res 
    .status(200)
    .json(
        new ApiResponse(
            200,
            tweets,
            "User tweets featched successfully"
        )
    )
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId} = req.params;
    const {content} = req.body;
    const tweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: {content}
        },
        {
            new: true
        }
    )
    return res 
    .status(200)
    .json(
        new ApiResponse(
            200,
            tweet,
            "Tweet updated successfully"
        )
    )

})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params;
    const tweet = await Tweet.findByIdAndDelete(tweetId);
    if(!tweet){
        throw new ApiError(400, "no tweet found")
    }
    return res 
    .status(200)
    .json(
        new ApiResponse(
            200,
            tweet,
            "tweet deleted successfully"
        )
    )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
