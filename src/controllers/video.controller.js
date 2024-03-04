import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { Like } from "../models/like.model.js"

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    console.log(userId);
    try {
        let pipeline = [];
    
        if(userId){
            pipeline.push(
                {
                    $match: {
                        owner: new mongoose.Types.ObjectId(userId)
                    },
                }
            );
        }
        if(sortBy && sortType){
            const sortOptions = {};
            sortOptions[sortBy] = sortType === "desc" ? -1 : 1;
            pipeline.push({
                $sort: sortOptions,
            });
        }
    
        pipeline.push(
            {
                $skip: (page-1) * parseInt(limit)
            },
            {
                $limit: parseInt(limit)
            }
        );
    
        pipeline.push(
            {
                $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "ownerDetails"
                },
            }
        );
        pipeline.push(
            {
                $unwind: "$ownerDetails",
            }
        );
        pipeline.push(
            {
                $project: {
                    videoFile: 1,
                    thumbnail: 1,
                    title: 1,
                    duration: 1,
                    views: 1,
                    owner: {
                        _id: "$ownerDetails._id",
                        fullName: "$ownerDetails.fullName",
                        avatar: "$ownerDetails.avatar",
                    },
                },
            }
        );
    
        const videos = await Video.aggregate(pipeline);
        
        if(!videos || videos.length ===0){
            return res
            .status(200)
            .json(200,
                [],
                "No videos found"    
            )
        }
        return res 
        .status(200)
        .json(
            new ApiResponse(
                200,
                videos,
                "All videosfetched successfully"
            )
        )
    } catch (error) {
        console.log(`Error in get all videos ${error?.message}`)
        throw new ApiError(error?.statusCode || 500, error?.message||"internal server error in get all videos")
    }
})

const publishAVideo = asyncHandler(async (req, res) => {
    // TODO: get video, upload to cloudinary, create video
    const {title, description} = req.body;
   
    //validate data
    if(title === "" || description === ""){
        throw new ApiError(400,"All field are required");
    }
    if(!req.files.thumbnail || !req.files.videoFile){
        throw new ApiError(400,"Video file and thumbnail are required");
    }
    // upload thumbNail and video to cloudinary
    let thumbnailurl = await uploadOnCloudinary(req?.files?.thumbnail[0].path);
    let videourl = await uploadOnCloudinary(req?.files?.videoFile[0].path);
    if(!videourl || !thumbnailurl){
        throw new ApiError(400, "Video file and thumbnail file are required");
    }
    //create video 
    const video = await Video.create(
        {
            videoFile: videourl.url,
            thumbnail: thumbnailurl.url,
            title: title,
            description: description,
            duration: videourl.duration,
            owner: req.user._id
        }
    );
    //return video
    return res 
    .status(200)
    .json(
        new ApiResponse(
            200, 
            video,
            "video created successfully"
        )
    )
})

const getVideoById = asyncHandler(async (req, res) => {
    //TODO: get video by id
    let { videoId } = req.params
    let video = await Video.aggregate(
        [
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(videoId)
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "owner",
                    pipeline: [
                        {
                            $project: {
                                username: 1,
                                avatar: 1,
                                fullname: 1
                            }
                        }
                    ]
                }
            },
            {
                $lookup: {
                    from: "likes",
                    localField: "_id",
                    foreignField: "video",
                    as: "likes"
                }
            },
            {
                $addFields: {
                    owner: {
                        $first: "$owner"
                    },
                    likes: {
                        $size: "$likes"
                    },
                    views: {
                        $add: [1, "$views"]
                    }
                }
            }
        ]
    )
    if(video.length > 0){
        video = video[0];
    }
    await Video.findByIdAndUpdate(videoId, {
        $set: {
            views: video.views
        }
    });

    return res 
    .status(200)
    .json(
        new ApiResponse(
            200,
            video,
            "video found",
            
        )
    )
})

const updateVideo = asyncHandler(async (req, res) => {
    //TODO: update video details like title, description, thumbnail
    const { videoId } = req.params
    const { title, description } = req.body;
    const thumbnailLocalPath = req.files?.path;

    if(!videoId){
        throw new ApiError(500, "Something went wrong");
    }
    if(!title || !description){
        throw new ApiError(400, "Title and description is required")
    }
    if(!thumbnailLocalPath){
        throw new ApiError(400, "Thumbnail is required")
    }
  
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if(!thumbnail){
        throw new ApiError(400, "Error while updating thumbnail")
    }
    
    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title: title,
                description: description,
                thumbnail: thumbnail.url
            }
        },
        {
            new: true
        }
    );

    if(!video){
        throw new ApiError(
            500,
            "Error while updating the title description and thumbnail"
        )
    }
    return res 
    .status(200)
    .json(
        new ApiResponse(
            200,
            video,
            "video updated"
        )
    )
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    
    if(!videoId){
        throw new ApiError(500, "Something went wrong")
    }

    const video = await Video.findByIdAndDelete(videoId);
    const comment = await Comment.deleteMany({video: videoId});
    const likes = await Like.deleteMany({video: videoId});

    if(!video || !comment || !likes){
        throw new ApiError(500, "Something went wrong while deleting")
    }
    return res 
    .status(200)
    .json(
        new ApiResponse(
            200,
            video,
            "Video deleted Successfully"
        )
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!videoId){
        throw new ApiError(500, "something went wrong")
    }

    const video = await Video.findByIdAndUpdate(
        {
            _id: videoId
        },
        {
            $set: {
                isPublished: {
                    $eq: [false, "$isPublished"]
                }
            }
        }
    )
    if(!video){
        throw new ApiError(404, "Video not found")
    }

    return res 
    .status(200)
    .json(
        new ApiResponse(
            200,
            video,
            "Video is published status updated"
        )
    )
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
