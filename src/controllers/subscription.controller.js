import mongoose, {isValidObjectId, mongo} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    // TODO: toggle subscription

    //get the channelid from params
    const {channelId} = req.params;
    if(!channelId){
        throw new ApiError(400, "Channel id not exist");
    }
    //check if channelid exist.
    const subscription = await Subscription.aggregate(
        [
            {
                $match: {
                    channel: new mongoose.Types.ObjectId(channelId)
                }
            },
            {
                $match: {
                    subscriber: new mongoose.Types.ObjectId(req?.user._id)
                }
            }
        ]
    );
    if(subscription[0]){
        await Subscription.deleteOne({_id: subscription[0]._id});
        return res.status(200).json(
            new ApiResponse(200, "unsubscribed successfully",{isSubscribed: false})
        )
    }else{
        await Subscription.create({
            subscriber: req?.user._id,
            channel: channelId,
        });
        return res.status(200).json(
            new ApiResponse(200, "subscribed successfully.", {isSubscribed: true})
        )
    }
    //get channel from db using id
    //if channel exist than update channel
    //check if updated
    //return res
})

const subscribedStatus = asyncHandler(async (req, res) => {
    // TODO: toggle subscription

    //get the channelid from params
    const {channelId} = req.params;
    if(!channelId){
        throw new ApiError(400, "Channel id not exist");
    }
    //check if channelid exist.
    const subscription = await Subscription.aggregate(
        [
            {
                $match: {
                    channel: new mongoose.Types.ObjectId(channelId)
                }
            },
            {
                $match: {
                    subscriber: new mongoose.Types.ObjectId(req?.user._id)
                }
            }
        ]
    );
    if(subscription[0]){
        
        return res.status(200).json(
            new ApiResponse(200, "unsubscribed successfully",{isSubscribed: false})
        )
    }else{
    
        return res.status(200).json(
            new ApiResponse(200, "subscribed successfully.", {isSubscribed: true})
        )
    }
   

})
// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    //get channelid from params
    //check if channel exist
    //get subscription model from database using channelid
    //get subscription subscriber entry
    //return res
    const {channelId} = req.params
    if(!channelId){
        throw new ApiError(400, "channelId not exists")
    }
    const subscribers = await Subscription.aggregate(
        [
            {
                $match: {
                    channel: new mongoose.Types.ObjectId(channelId),
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "subscriber",
                    foreignField: "_id",
                    as: "subscribers",
                    pipeline: [
                        {$project: {
                            username: 1,
                            avatar: 1,
                        }}
                    ]
                }
            },
            {
                $addFields: {
                    subscribers: "$subscribers"
                }
            },{
                $project: {
                    subscribers: 1,
                }
            }
        ]
    )
    return res 
    .status(200)
    .json(
        new ApiResponse(
            200,
            "successfully fetched subscribers",
            subscribers
        )
    )
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    //get subscribersid from params
    //check if subscribersid exist
    //get subscription model from database using subscriberid
    //get subscription channel exist
    //return res
    const { subscriberId } = req.params
    
    const subscriptions = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "subscribers",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            avatar: 1,
                        }
                    }
                ]
            }
        }, 
        {
            $addFields: {
                subscriptions: "$subscribers"
            }
        },
        {
            $project: {
                subscriptions: 1,
            }
        }
    ])
    return res 
    .status(200)
    .json(
        new ApiResponse(200, subscriptions,"successfully fetched subscriptions")
    )
    

})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels,
    subscribedStatus
    
}
