"use server"

import { put, list } from "@vercel/blob"
import { revalidatePath } from "next/cache"

export interface FeedImage {
  id: string
  url: string
  timestamp: string
  caps: number
  likes?: number
  comments?: number
}

export async function uploadImageToFeed(imageData: string, caps: number) {
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
      comments: 0,
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

    return { success: true, imageUrl: blob.url }
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

    return { success: true }
  } catch (error) {
    console.error("Error toggling like:", error)
    return { success: false }
  }
}
