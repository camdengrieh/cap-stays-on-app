"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Heart, MessageCircle, Share2, Send, Calendar, Loader2 } from "lucide-react"
import { toggleLike, addComment, type FeedImage, type Comment } from "../../actions"
import Link from "next/link"

interface PostClientProps {
  post: FeedImage
}

export default function PostClient({ post }: PostClientProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [likes, setLikes] = useState(post.likes || 0)
  const [comments, setComments] = useState<Comment[]>(post.comments || [])
  const [newComment, setNewComment] = useState("")
  const [commentAuthor, setCommentAuthor] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleLike = async () => {
    // Optimistic update
    setIsLiked(!isLiked)
    setLikes((prev) => (isLiked ? prev - 1 : prev + 1))

    try {
      await toggleLike(post.id)
    } catch (error) {
      // Revert on error
      setIsLiked(isLiked)
      setLikes(post.likes || 0)
      console.error("Error toggling like:", error)
    }
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || isSubmitting) return

    setIsSubmitting(true)

    try {
      const result = await addComment(post.id, newComment, commentAuthor.trim() || undefined)

      if (result.success && result.comment) {
        setComments((prev) => [...prev, result.comment!])
        setNewComment("")
        setCommentAuthor("")
      } else {
        alert("Failed to add comment. Please try again.")
      }
    } catch (error) {
      console.error("Error adding comment:", error)
      alert("There was an error adding your comment. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const sharePost = () => {
    try {
      const text = "#CapStaysOn - capstayson.fun"
      const url = `https://capstayson.fun/post/${post.id}`
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`

      try {
        const newWindow = window.open(twitterUrl, "_blank", "noopener,noreferrer")
        if (!newWindow) {
          alert("Twitter sharing popup was blocked. Please allow popups or use the link: " + twitterUrl)
        }
      } catch (e) {
        alert("Could not open Twitter. Please try again or copy this URL: " + twitterUrl)
      }
    } catch (error) {
      console.error("Error sharing post:", error)
      alert("There was an error sharing this post. Please try again.")
    }
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="ghost"
              size="lg"
              onClick={handleLike}
              className={`flex-1 ${isLiked ? "text-red-500 hover:text-red-600" : "text-gray-500 hover:text-red-500"}`}
            >
              <Heart className={`w-5 h-5 mr-2 ${isLiked ? "fill-current" : ""}`} />
              {likes} {likes === 1 ? "Like" : "Likes"}
            </Button>

            <Button variant="ghost" size="lg" className="flex-1 text-gray-500 hover:text-blue-500">
              <MessageCircle className="w-5 h-5 mr-2" />
              {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
            </Button>

            <Button variant="ghost" size="lg" onClick={sharePost} className="flex-1 text-gray-500 hover:text-blue-500">
              <Share2 className="w-5 h-5 mr-2" />
              Share
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add Comment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Add a Comment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddComment} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="comment-author">Your Handle (Optional)</Label>
                <Input
                  id="comment-author"
                  placeholder="@yourhandle"
                  value={commentAuthor}
                  onChange={(e) => setCommentAuthor(e.target.value.replace(/^@/, ""))}
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="comment-text">Comment</Label>
              <Textarea
                id="comment-text"
                placeholder="Share your thoughts about this cap creation..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={isSubmitting}
                rows={3}
              />
            </div>
            <Button type="submit" disabled={!newComment.trim() || isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Post Comment
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Comments List */}
      {comments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Comments ({comments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-gray-600 text-sm font-bold">
                        {comment.author ? comment.author[0].toUpperCase() : "?"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {comment.author ? (
                          <Link
                            href={`/profile/${comment.author}`}
                            className="font-semibold text-sm hover:text-teal-600 transition-colors"
                          >
                            @{comment.author}
                          </Link>
                        ) : (
                          <span className="font-semibold text-sm text-gray-600">Anonymous</span>
                        )}
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {formatDate(comment.timestamp)}
                        </div>
                      </div>
                      <p className="text-gray-800 text-sm leading-relaxed">{comment.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {comments.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-gray-500">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No comments yet</h3>
              <p>Be the first to share your thoughts about this cap creation!</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
