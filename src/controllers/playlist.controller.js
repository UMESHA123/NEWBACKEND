import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"
import { Video } from "../models/video.model.js"

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body

    //TODO: create playlist
    const playlist = await Playlist.create(
        {
            name,
            description, owner: req.user._id
        }
    )
    if (!playlist) {
        throw new ApiError(500, "Somethng went wrong")
    }
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                playlist,
                "Playlist created"
            )
        )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params
    //TODO: get user playlists
    const playlists = await Playlist.find({ owner: userId })
    if (!playlists) {
        throw new ApiError(400, "playlists not found")
    }
    for(let i=0;i<playlists.length;i++){
        let newVideos = await Promise.all(playlists[i].videos.map(videoId => Video.findById(videoId)));
        playlists[i].videos = newVideos;
    }
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                playlists,
                "user playlists featched successfully"
            )
        )
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    //TODO: get playlist by id
    const playlists = await Playlist.findById(playlistId);
    if (!playlists) {
        throw new ApiError(400, "Playlist not found");
    }

    // Fetch owner details
    let user = await User.findById(playlists.owner).select(
        "-email -watchHistory -coverImage -password -refreshToken"
    );
    playlists.owner = user;

    // Fetch video details for each video in the playlist
    try {
        const newVideos = await Promise.all(playlists.videos.map(videoId => Video.findById(videoId)));
        playlists.videos = newVideos;

        return res.status(200).json(new ApiResponse(200, playlists, "Playlist fetched successfully"));
    } catch (error) {
        console.error("Error fetching video details:", error);
        throw new ApiError(500, "Error fetching video details");
    }
});


const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    const videoToPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $push: {
                videos: videoId
            }
        },
        {
            new: true
        }
    ).populate('videos')
    if (!videoToPlaylist) {
        throw new ApiError(
            400,
            "something went wrong"
        )
    }
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                videoToPlaylist,
                "Video added successfully"
            )
        )
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    // TODO: remove video from playlist
    const removeVideofromPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: {
                videos: {
                    $in: [videoId]
                }
            }
        }, {
        new: true
    }
    ).populate("videos")
    if (!removeVideofromPlaylist) {
        throw new ApiError(400, "Something went wrong")
    }
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                removeVideofromPlaylist,
                "video deleted from playlist successfully"
            )
        )
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    // TODO: delete playlist
    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);
    if (!deletedPlaylist) {
        throw new ApiError(400, "something went wrong ")
    }
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                deletedPlaylist,
                "playlist deleted successfully"
            )
        )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body
    //TODO: update playlist
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: { name, description }
        },
        {
            new: true
        }
    )
    if (!updatedPlaylist) {
        throw new ApiError(400, "something went wrong")
    }
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedPlaylist,
                "playlist updated successfully"
            )
        )
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
