"use server"

import { put, list } from "@vercel/blob"
import { revalidatePath } from "next/cache"

export interface Comment {
  id: string
  text: string
  author?: string
  timestamp: string
}

export interface FeedImage {
  id: string
  url: string
  timestamp: string
  caps: number
  likes?: number
  comments?: Comment[]
  twitterHandle?: string
}

export interface UserProfile {
  handle: string
  totalCreations: number
  totalLikes: number
  joinedDate: string
  images: FeedImage[]
}

export async function uploadImageToFeed(imageData: string, caps: number, twitterHandle?: string) {
  try {
    // Convert base64 to blob
    const base64Data = imageData.split(",")[1]
    const buffer = Buffer.from(base64Data, "base64")

    // Generate unique filename
    const filename = `cap-creation-${Date.now()}.png`

    // Upload to Vercel Blob
    const blob = await put(filename, buffer, {
      access: "public",
      contentType: "image/png",
    })

    // Store metadata in a simple JSON file (in a real app, you'd use a database)
    const feedData: FeedImage = {
      id: Date.now().toString(),
      url: blob.url,
      timestamp: new Date().toISOString(),
      caps,
      likes: 0,
      comments: [],
      twitterHandle: twitterHandle || undefined,
    }

    // Get existing feed metadata
    let feedMetadata: FeedImage[] = []
    try {
      const { blobs } = await list({ prefix: "feed-metadata.json" })
      if (blobs.length > 0) {
        const response = await fetch(blobs[0].url)
        feedMetadata = await response.json()
      }
    } catch (error) {
      console.log("No existing feed metadata found, creating new")
    }

    // Add new image to feed
    feedMetadata.unshift(feedData)

    // Keep only the latest 100 images
    feedMetadata = feedMetadata.slice(0, 100)

    // Save updated metadata
    await put("feed-metadata.json", JSON.stringify(feedMetadata), {
      access: "public",
      contentType: "application/json",
    })

    revalidatePath("/feed")
    revalidatePath("/")

    return { success: true, imageUrl: blob.url, imageId: feedData.id }
  } catch (error) {
    console.error("Error uploading to feed:", error)
    return { success: false, error: "Failed to upload image" }
  }
}

export async function getFeedImages(): Promise<FeedImage[]> {
  try {
    const { blobs } = await list({ prefix: "feed-metadata.json" })

    if (blobs.length === 0) {
      return []
    }

    const response = await fetch(blobs[0].url)
    const feedMetadata: FeedImage[] = await response.json()

    return feedMetadata
  } catch (error) {
    console.error("Error fetching feed images:", error)
    return []
  }
}

export async function getPostById(id: string): Promise<FeedImage | null> {
  try {
    const allImages = await getFeedImages()
    return allImages.find((image) => image.id === id) || null
  } catch (error) {
    console.error("Error fetching post:", error)
    return null
  }
}

export async function getRecentFeedImages(limit = 6): Promise<FeedImage[]> {
  try {
    const allImages = await getFeedImages()
    return allImages.slice(0, limit)
  } catch (error) {
    console.error("Error fetching recent feed images:", error)
    return []
  }
}

export async function getUserProfile(handle: string): Promise<UserProfile | null> {
  try {
    const allImages = await getFeedImages()
    const userImages = allImages.filter((image) => image.twitterHandle?.toLowerCase() === handle.toLowerCase())

    if (userImages.length === 0) {
      return null
    }

    // Calculate stats
    const totalLikes = userImages.reduce((sum, image) => sum + (image.likes || 0), 0)
    const joinedDate = userImages[userImages.length - 1].timestamp // First upload date

    return {
      handle,
      totalCreations: userImages.length,
      totalLikes,
      joinedDate,
      images: userImages,
    }
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return null
  }
}

export async function getAllUsers(): Promise<string[]> {
  try {
    const allImages = await getFeedImages()
    const handles = new Set<string>()

    allImages.forEach((image) => {
      if (image.twitterHandle) {
        handles.add(image.twitterHandle)
      }
    })

    return Array.from(handles).sort()
  } catch (error) {
    console.error("Error fetching all users:", error)
    return []
  }
}

export async function toggleLike(imageId: string) {
  try {
    // Get existing feed metadata
    const { blobs } = await list({ prefix: "feed-metadata.json" })
    if (blobs.length === 0) return { success: false }

    const response = await fetch(blobs[0].url)
    let feedMetadata: FeedImage[] = await response.json()

    // Find and update the image
    feedMetadata = feedMetadata.map((image) => {
      if (image.id === imageId) {
        return {
          ...image,
          likes: (image.likes || 0) + 1,
        }
      }
      return image
    })

    // Save updated metadata
    await put("feed-metadata.json", JSON.stringify(feedMetadata), {
      access: "public",
      contentType: "application/json",
    })

    revalidatePath("/feed")
    revalidatePath("/profile/[handle]", "page")
    revalidatePath("/post/[id]", "page")

    return { success: true }
  } catch (error) {
    console.error("Error toggling like:", error)
    return { success: false }
  }
}

export async function addComment(imageId: string, text: string, author?: string) {
  try {
    // Get existing feed metadata
    const { blobs } = await list({ prefix: "feed-metadata.json" })
    if (blobs.length === 0) return { success: false }

    const response = await fetch(blobs[0].url)
    let feedMetadata: FeedImage[] = await response.json()

    // Create new comment
    const newComment: Comment = {
      id: Date.now().toString(),
      text: text.trim(),
      author: author || undefined,
      timestamp: new Date().toISOString(),
    }

    // Find and update the image
    feedMetadata = feedMetadata.map((image) => {
      if (image.id === imageId) {
        return {
          ...image,
          comments: [...(image.comments || []), newComment],
        }
      }
      return image
    })

    // Save updated metadata
    await put("feed-metadata.json", JSON.stringify(feedMetadata), {
      access: "public",
      contentType: "application/json",
    })

    revalidatePath("/feed")
    revalidatePath("/profile/[handle]", "page")
    revalidatePath("/post/[id]", "page")

    return { success: true, comment: newComment }
  } catch (error) {
    console.error("Error adding comment:", error)
    return { success: false, error: "Failed to add comment" }
  }
}
