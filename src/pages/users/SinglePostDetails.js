import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Heart, 
  MessageCircle, 
  Calendar, 
  User, 
  Image as ImageIcon, 
  Video as VideoIcon,
  Trash2,
  Loader2,
  AlertCircle,
  ExternalLink
} from "lucide-react";

const SinglePostDetails = ({ darkMode }) => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  /* ================= FETCH POST DETAILS ================= */
  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`http://194.164.148.237:5002/api/post/${postId}`);
        const data = await response.json();
        
        if (data.success) {
          setPost(data.data);
        } else {
          setError("Failed to load post details");
        }
      } catch (err) {
        console.error("Error fetching post:", err);
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchPostDetails();
  }, [postId]);

  /* ================= DELETE POST ================= */
  const handleDeletePost = async () => {
    if (!window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      return;
    }

    try {
      setDeleting(true);
      const response = await fetch(
        `https://apisocial.atozkeysolution.com/api/deletePost/${post.userId._id}/${postId}`,
        { method: "DELETE" }
      );
      const data = await response.json();

      if (data.success) {
        alert("Post deleted successfully!");
        navigate(-1);
      } else {
        alert("Failed to delete post");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Delete failed. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  /* ================= LOADING STATE ================= */
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
        <div className="text-center">
          <Loader2 className={`w-12 h-12 animate-spin mx-auto mb-4 ${darkMode ? "text-indigo-400" : "text-indigo-600"}`} />
          <p className={`text-lg font-medium ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            Loading post details...
          </p>
        </div>
      </div>
    );
  }

  /* ================= ERROR STATE ================= */
  if (error || !post) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
        <div className="text-center max-w-md p-6">
          <AlertCircle className={`w-16 h-16 mx-auto mb-4 ${darkMode ? "text-red-400" : "text-red-600"}`} />
          <h2 className={`text-xl font-bold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
            Post Not Found
          </h2>
          <p className={`mb-6 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            {error || "The post you're looking for doesn't exist or has been removed."}
          </p>
          <button
            onClick={() => navigate(-1)}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              darkMode 
                ? "bg-gray-800 hover:bg-gray-700 text-white" 
                : "bg-gray-100 hover:bg-gray-200 text-gray-900"
            }`}
          >
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? "dark bg-gray-900" : "bg-gray-50"}`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className={`p-2 rounded-xl transition-colors ${
                darkMode 
                  ? "bg-gray-800 hover:bg-gray-700 text-gray-300" 
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className={`text-2xl md:text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                Post Details
              </h1>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                Post ID: {postId.slice(0, 8)}...
              </p>
            </div>
          </div>

          {/* DELETE BUTTON */}
          <button
            onClick={handleDeletePost}
            disabled={deleting}
            className={`px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
              deleting
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            } text-white`}
          >
            {deleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Delete Post
              </>
            )}
          </button>
        </div>

        {/* MAIN CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* LEFT COLUMN - MEDIA */}
          <div className={`rounded-2xl overflow-hidden ${darkMode ? "bg-gray-800/50 border border-gray-700" : "bg-white border border-gray-200 shadow-lg"}`}>
            {/* MAIN MEDIA DISPLAY */}
            <div className="relative aspect-square bg-gray-900">
              {post.media[currentImageIndex]?.type === "video" ? (
                <div className="relative w-full h-full">
                  <video
                    src={post.media[currentImageIndex].url}
                    controls
                    className="w-full h-full object-contain"
                    poster={post.media[currentImageIndex].thumbnail}
                  />
                  <div className={`absolute top-4 left-4 px-3 py-1 rounded-full flex items-center gap-2 ${
                    darkMode ? "bg-gray-900/80 text-white" : "bg-white/80 text-gray-900"
                  }`}>
                    <VideoIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">Video</span>
                  </div>
                </div>
              ) : (
                <>
                  <img
                    src={post.media[currentImageIndex]?.url}
                    alt={`Post media ${currentImageIndex + 1}`}
                    className="w-full h-full object-contain"
                  />
                  <div className={`absolute top-4 left-4 px-3 py-1 rounded-full flex items-center gap-2 ${
                    darkMode ? "bg-gray-900/80 text-white" : "bg-white/80 text-gray-900"
                  }`}>
                    <ImageIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">Image</span>
                  </div>
                </>
              )}
            </div>

            {/* MEDIA THUMBNAILS */}
            {post.media.length > 1 && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                  {post.media.map((media, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        currentImageIndex === index
                          ? "border-indigo-500 ring-2 ring-indigo-500/20"
                          : "border-transparent hover:border-gray-300 dark:hover:border-gray-600"
                      }`}
                    >
                      <img
                        src={media.url}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {media.type === "video" && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <VideoIcon className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div className={`absolute bottom-1 right-1 text-xs px-1 rounded ${
                        darkMode ? "bg-gray-900/80 text-white" : "bg-white/80 text-gray-900"
                      }`}>
                        {index + 1}
                      </div>
                    </button>
                  ))}
                </div>
                <p className={`text-xs text-center mt-3 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  Click on thumbnails to switch media ({post.media.length} total)
                </p>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN - DETAILS */}
          <div className="space-y-6">
            {/* USER INFO CARD */}
            <div className={`rounded-2xl p-6 ${darkMode ? "bg-gray-800/50 border border-gray-700" : "bg-white border border-gray-200 shadow-lg"}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-xl font-bold flex items-center gap-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
                  <User className="w-5 h-5" />
                  Author Information
                </h2>
                <button
                  onClick={() => navigate(`/admin/users/${post.userId._id}/posts`)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    darkMode 
                      ? "bg-gray-700 hover:bg-gray-600 text-gray-300" 
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                >
                  <ExternalLink className="w-3 h-3" />
                  View All Posts
                </button>
              </div>
              
              <div className="flex items-center gap-4">
                <img
                  src={post.userId.profile?.image || "/assets/images/profile.png"}
                  alt={post.userId.fullName}
                  className="w-16 h-16 rounded-full object-cover border-4 border-indigo-500/20"
                />
                <div>
                  <h3 className={`text-lg font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                    {post.userId.fullName}
                  </h3>
                  <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    @{post.userId.profile?.username}
                  </p>
                  <p className={`text-xs mt-1 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                    User ID: {post.userId._id.slice(0, 8)}...
                  </p>
                </div>
              </div>
            </div>

            {/* POST METADATA CARD */}
            <div className={`rounded-2xl p-6 ${darkMode ? "bg-gray-800/50 border border-gray-700" : "bg-white border border-gray-200 shadow-lg"}`}>
              <h2 className={`text-xl font-bold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
                Post Information
              </h2>
              
              <div className="space-y-4">
                {/* DESCRIPTION */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    Description
                  </label>
                  <div className={`p-4 rounded-xl ${darkMode ? "bg-gray-800 text-gray-300" : "bg-gray-50 text-gray-700"}`}>
                    {post.description || "No description provided"}
                  </div>
                </div>

                {/* STATS */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className={`p-4 rounded-xl text-center ${darkMode ? "bg-gray-800" : "bg-gray-50"}`}>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Heart className={`w-5 h-5 ${darkMode ? "text-red-400" : "text-red-600"}`} />
                      <span className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                        {post.likes?.length || 0}
                      </span>
                    </div>
                    <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Likes</p>
                  </div>

                  <div className={`p-4 rounded-xl text-center ${darkMode ? "bg-gray-800" : "bg-gray-50"}`}>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <MessageCircle className={`w-5 h-5 ${darkMode ? "text-blue-400" : "text-blue-600"}`} />
                      <span className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                        {post.comments?.length || 0}
                      </span>
                    </div>
                    <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Comments</p>
                  </div>

                  <div className={`p-4 rounded-xl text-center ${darkMode ? "bg-gray-800" : "bg-gray-50"}`}>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <ImageIcon className={`w-5 h-5 ${darkMode ? "text-purple-400" : "text-purple-600"}`} />
                      <span className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                        {post.media?.length || 0}
                      </span>
                    </div>
                    <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Media Files</p>
                  </div>
                </div>

                {/* DATES */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Created
                    </label>
                    <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      {new Date(post.createdAt).toLocaleString('en-US', {
                        dateStyle: 'full',
                        timeStyle: 'short'
                      })}
                    </p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Last Updated
                    </label>
                    <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      {new Date(post.updatedAt).toLocaleString('en-US', {
                        dateStyle: 'full',
                        timeStyle: 'short'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* COMMENTS CARD */}
            {post.comments?.length > 0 && (
              <div className={`rounded-2xl p-6 ${darkMode ? "bg-gray-800/50 border border-gray-700" : "bg-white border border-gray-200 shadow-lg"}`}>
                <h2 className={`text-xl font-bold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
                  Comments ({post.comments.length})
                </h2>
                
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {post.comments.map((comment, index) => (
                    <div 
                      key={comment._id} 
                      className={`p-4 rounded-xl ${darkMode ? "bg-gray-800" : "bg-gray-50"}`}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <img
                          src={comment.userId.profile?.image || "/assets/images/profile.png"}
                          alt={comment.userId.fullName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <h4 className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                            {comment.userId.fullName}
                          </h4>
                          <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                            @{comment.userId.profile?.username}
                          </p>
                        </div>
                        <span className={`text-xs ml-auto ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                        {comment.text}
                      </p>
                      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-700 dark:border-gray-600">
                        <span className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                          Comment ID: {comment._id.slice(0, 8)}...
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TECHNICAL DETAILS */}
            <div className={`rounded-2xl p-6 ${darkMode ? "bg-gray-800/50 border border-gray-700" : "bg-white border border-gray-200 shadow-lg"}`}>
              <h2 className={`text-xl font-bold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
                Technical Details
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Post ID</span>
                  <code className={`text-xs px-2 py-1 rounded ${darkMode ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-700"}`}>
                    {post._id}
                  </code>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>User ID</span>
                  <code className={`text-xs px-2 py-1 rounded ${darkMode ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-700"}`}>
                    {post.userId._id}
                  </code>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Media Types</span>
                  <div className="flex gap-1">
                    {[...new Set(post.media.map(m => m.type))].map(type => (
                      <span 
                        key={type}
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          type === 'image' 
                            ? darkMode ? "bg-blue-900/30 text-blue-400" : "bg-blue-100 text-blue-800"
                            : darkMode ? "bg-purple-900/30 text-purple-400" : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SinglePostDetails;