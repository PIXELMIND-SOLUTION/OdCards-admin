import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const PAGE_SIZES = [8, 12, 24];

const AdminUserPosts = ({ darkMode }) => {
  const { userId } = useParams();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  // search / filter / pagination
  const [search, setSearch] = useState("");
  const [mediaFilter, setMediaFilter] = useState("all"); // all | image | video
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);

  useEffect(() => {
    fetchPosts();
  }, [userId]);

  /* ================= FETCH ================= */
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `https://apisocial.atozkeysolution.com/api/posts/user/${userId}`
      );
      const data = await res.json();
      setPosts(data.data || []);
    } catch (err) {
      console.error("Failed to load posts", err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE ================= */
  const handleDeletePost = async (postId, uid) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      setDeletingId(postId);
      const res = await fetch(
        `https://apisocial.atozkeysolution.com/api/deletePost/${uid}/${postId}`,
        { method: "DELETE" }
      );
      const data = await res.json();

      if (data.success) {
        setPosts((prev) => prev.filter((p) => p._id !== postId));
      } else {
        alert("Failed to delete post");
      }
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  /* ================= FILTERED DATA ================= */
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      const text =
        `${p.description || ""} ${p.userId?.fullName || ""} ${
          p.userId?.profile?.username || ""
        }`.toLowerCase();

      const matchesSearch = text.includes(search.toLowerCase());

      const mediaType = p.media?.[0]?.type;
      const matchesMedia =
        mediaFilter === "all" || mediaType === mediaFilter;

      return matchesSearch && matchesMedia;
    });
  }, [posts, search, mediaFilter]);

  /* ================= PAGINATION ================= */
  const totalPages = Math.ceil(filteredPosts.length / pageSize);
  const paginatedPosts = filteredPosts.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  useEffect(() => {
    setPage(1);
  }, [search, mediaFilter, pageSize]);

  /* ================= UI ================= */
  return (
    <div className="space-y-6">
      <button onClick={() => window.history.back()} className="text-white hover:underline bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded">Back</button>
      {/* HEADER */}
      <h1
        className={`text-2xl font-bold ${
          darkMode ? "text-white" : "text-gray-800"
        }`}
      >
        User Posts ({filteredPosts.length})
      </h1>

      {/* CONTROLS */}
      <div
        className={`flex flex-col sm:flex-row gap-4 p-4 rounded-xl ${
          darkMode ? "bg-gray-800" : "bg-white shadow"
        }`}
      >
        <input
          placeholder="Search posts or user..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 rounded border focus:outline-none"
        />

        <select
          value={mediaFilter}
          onChange={(e) => setMediaFilter(e.target.value)}
          className="px-4 py-2 rounded border"
        >
          <option value="all">All Media</option>
          <option value="image">Images</option>
          <option value="video">Videos</option>
        </select>

        <select
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
          className="px-4 py-2 rounded border"
        >
          {PAGE_SIZES.map((s) => (
            <option key={s} value={s}>
              {s} / page
            </option>
          ))}
        </select>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* EMPTY */}
      {!loading && paginatedPosts.length === 0 && (
        <p className="text-center text-gray-500 py-20">
          No posts found.
        </p>
      )}

      {/* POSTS GRID */}
      <div
        className="
          grid gap-4
          grid-cols-1
          sm:grid-cols-2
          md:grid-cols-3
          lg:grid-cols-4
        "
      >
        {paginatedPosts.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            darkMode={darkMode}
            deleting={deletingId === post._id}
            onDelete={handleDeletePost}
          />
        ))}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-6 flex-wrap">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 rounded ${
                page === i + 1
                  ? "bg-orange-500 text-white"
                  : "border"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

/* ================= POST CARD ================= */
const PostCard = ({ post, darkMode, onDelete, deleting }) => {
  const media = post.media?.[0];

  const navigate = useNavigate();

  return (
    <div
      className={`relative rounded-xl overflow-hidden shadow transition ${
        darkMode ? "bg-gray-800 text-white" : "bg-white"
      }`}
    >
      {/* DELETE */}
      <button
        onClick={() => onDelete(post._id, post.userId._id)}
        disabled={deleting}
        className="absolute top-2 right-2 z-10 bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded-full"
      >
        {deleting ? "Deleting…" : "Delete"}
      </button>

      {/* MEDIA */}
      <div className="aspect-square bg-black">
        {media?.type === "video" ? (
          <video src={media.url} controls className="w-full h-full object-cover" />
        ) : (
          <img src={media?.url} alt="post" className="w-full h-full object-cover" />
        )}
      </div>

      {/* CONTENT */}
      <div className="p-4 space-y-2">
        <div className="flex items-center gap-3" onClick={() => navigate(`/admin/user/post/${post._id}`)}>
          <img
            src={post.userId?.profile?.image || "/assets/images/profile.png"}
            alt="user"
            className="w-9 h-9 rounded-full object-cover"
          />
          <div>
            <p className="font-semibold text-sm">
              {post.userId?.fullName}
            </p>
            <p className="text-xs text-gray-500">
              @{post.userId?.profile?.username}
            </p>
          </div>
        </div>

        {post.description && (
          <p className="text-sm line-clamp-2">{post.description}</p>
        )}

        <div className="flex justify-between text-xs text-gray-500 pt-2">
          <span>❤️ {post.likes?.length || 0}</span>
          <span>💬 {post.comments?.length || 0}</span>
          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export default AdminUserPosts;
