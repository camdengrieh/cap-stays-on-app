import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Calendar, Heart, ImageIcon, ExternalLink, Trophy, Users } from "lucide-react"
import Link from "next/link"
import { getUserProfile, getAllUsers } from "../../actions"
import ProfileClient from "./profile-client"
import { notFound } from "next/navigation"

interface ProfilePageProps {
  params: {
    handle: string
  }
}

export async function generateStaticParams() {
  const users = await getAllUsers()
  return users.map((handle) => ({
    handle: handle,
  }))
}

export async function generateMetadata({ params }: ProfilePageProps) {
  const userProfile = await getUserProfile(params.handle)

  if (!userProfile) {
    return {
      title: "User Not Found - Cap Stays On",
      description: "This user profile could not be found.",
    }
  }

  return {
    title: `@${userProfile.handle} - Cap Stays On`,
    description: `Check out @${userProfile.handle}'s cap creations! ${userProfile.totalCreations} creations with ${userProfile.totalLikes} total likes.`,
    openGraph: {
      title: `@${userProfile.handle} - Cap Stays On`,
      description: `${userProfile.totalCreations} cap creations with ${userProfile.totalLikes} total likes`,
      images: userProfile.images.length > 0 ? [userProfile.images[0].url] : ["/cap.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: `@${userProfile.handle} - Cap Stays On`,
      description: `${userProfile.totalCreations} cap creations with ${userProfile.totalLikes} total likes`,
      images: userProfile.images.length > 0 ? [userProfile.images[0].url] : ["/cap.png"],
    },
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const userProfile = await getUserProfile(params.handle)

  if (!userProfile) {
    notFound()
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    })
  }

  const averageLikes =
    userProfile.totalCreations > 0 ? Math.round(userProfile.totalLikes / userProfile.totalCreations) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/feed">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Feed
            </Button>
          </Link>
        </div>

        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 bg-gradient-to-br from-teal-500 to-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                🧢
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                  <h1 className="text-3xl font-bold text-teal-800">@{userProfile.handle}</h1>
                  <a
                    href={`https://twitter.com/${userProfile.handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View on Twitter
                  </a>
                </div>

                <div className="flex items-center gap-2 text-gray-600 mb-6">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {formatDate(userProfile.joinedDate)}</span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-white rounded-lg border">
                    <div className="flex items-center justify-center mb-2">
                      <ImageIcon className="w-5 h-5 text-teal-600" />
                    </div>
                    <div className="text-2xl font-bold text-teal-800">{userProfile.totalCreations}</div>
                    <div className="text-sm text-gray-600">Creations</div>
                  </div>

                  <div className="text-center p-4 bg-white rounded-lg border">
                    <div className="flex items-center justify-center mb-2">
                      <Heart className="w-5 h-5 text-red-500" />
                    </div>
                    <div className="text-2xl font-bold text-red-600">{userProfile.totalLikes}</div>
                    <div className="text-sm text-gray-600">Total Likes</div>
                  </div>

                  <div className="text-center p-4 bg-white rounded-lg border">
                    <div className="flex items-center justify-center mb-2">
                      <Trophy className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div className="text-2xl font-bold text-yellow-600">{averageLikes}</div>
                    <div className="text-sm text-gray-600">Avg. Likes</div>
                  </div>

                  <div className="text-center p-4 bg-white rounded-lg border">
                    <div className="flex items-center justify-center mb-2">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="text-2xl font-bold text-purple-600">
                      {userProfile.images.reduce((sum, img) => sum + img.caps, 0)}
                    </div>
                    <div className="text-sm text-gray-600">Total Caps</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User's Creations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Cap Creations ({userProfile.totalCreations})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userProfile.images.length === 0 ? (
              <div className="text-center py-12">
                <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2 text-gray-600">No creations yet</h3>
                <p className="text-gray-500">This user hasn't uploaded any cap creations.</p>
              </div>
            ) : (
              <ProfileClient userProfile={userProfile} />
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <footer className="mt-12 py-6 border-t border-teal-200">
          <div className="text-center">
            <p className="text-teal-600">
              Created by{" "}
              <a
                href="https://x.com/camdenincrypto"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold hover:text-teal-800 transition-colors underline"
              >
                Camden
              </a>
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}
