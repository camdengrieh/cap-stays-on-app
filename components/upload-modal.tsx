"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Upload, Loader2, Share2, CheckCircle } from "lucide-react"

interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
  onUpload: (twitterHandle?: string) => Promise<void>
  onTweet: () => void
  isUploading: boolean
  uploadSuccess: boolean
}

export default function UploadModal({
  isOpen,
  onClose,
  onUpload,
  onTweet,
  isUploading,
  uploadSuccess,
}: UploadModalProps) {
  const [twitterHandle, setTwitterHandle] = useState("")
  const [step, setStep] = useState<"upload" | "success">("upload")

  const handleUpload = async () => {
    await onUpload(twitterHandle.trim() || undefined)
    if (!isUploading) {
      setStep("success")
    }
  }

  const handleTweetAndClose = () => {
    onTweet()
    onClose()
    setStep("upload")
    setTwitterHandle("")
  }

  const handleClose = () => {
    onClose()
    setStep("upload")
    setTwitterHandle("")
  }

  const formatTwitterHandle = (handle: string) => {
    // Remove @ if user includes it
    const cleaned = handle.replace(/^@/, "")
    return cleaned
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {step === "upload" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload to Community Feed
              </DialogTitle>
              <DialogDescription>
                Share your cap creation with the community! Optionally add your Twitter handle to get credit.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="twitter-handle">Twitter Handle (Optional)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">@</span>
                  <Input
                    id="twitter-handle"
                    placeholder="camdenincrypto"
                    value={twitterHandle}
                    onChange={(e) => setTwitterHandle(formatTwitterHandle(e.target.value))}
                    className="pl-8"
                    disabled={isUploading}
                  />
                </div>
                <p className="text-xs text-gray-500">Your handle will be displayed with your creation in the feed</p>
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={handleClose} disabled={isUploading}>
                Cancel
              </Button>
              <Button onClick={handleUpload} disabled={isUploading} className="bg-teal-600 hover:bg-teal-700">
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload to Feed
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "success" && uploadSuccess && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                Successfully Uploaded!
              </DialogTitle>
              <DialogDescription>
                Your cap creation has been added to the community feed. Ready to share it on Twitter?
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  🎉 Your image is now live in the community feed! Share it with the world using #capstayson
                </p>
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
              <Button onClick={handleTweetAndClose} className="bg-blue-500 hover:bg-blue-600">
                <Share2 className="w-4 h-4 mr-2" />
                Tweet Creation
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
