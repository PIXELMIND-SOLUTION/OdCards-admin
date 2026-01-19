import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
  FaEdit,
  FaTrash,
  FaStar,
  FaMoon,
  FaSun,
} from "react-icons/fa";

const Reviews = ( {darkMode} ) => {

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    rating: 5,
    comment: "",
    image: null,
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentReviewId, setCurrentReviewId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  /* ================= FETCH ================= */
  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await axios.get(
        "http://31.97.206.144:9124/api/reviews/allreviews"
      );
      setReviews(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= HANDLERS ================= */
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFormData({ ...formData, image: file });
    setPreviewImage(URL.createObjectURL(file));
  };

  const resetForm = () => {
    setFormData({ name: "", rating: 5, comment: "", image: null });
    setPreviewImage(null);
    setIsEditing(false);
    setCurrentReviewId(null);
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const data = new FormData();
    data.append("name", formData.name);
    data.append("rating", formData.rating);
    data.append("comment", formData.comment);
    if (formData.image) data.append("image", formData.image);

    try {
      if (isEditing) {
        await axios.put(
          `http://31.97.206.144:9124/api/reviews/updatereview/${currentReviewId}`,
          data
        );
        Swal.fire("Updated", "Review updated successfully", "success");
      } else {
        await axios.post(
          "http://31.97.206.144:9124/api/reviews/create-review",
          data
        );
        Swal.fire("Created", "Review created successfully", "success");
      }
      resetForm();
      fetchReviews();
    } catch {
      Swal.fire("Error", "Failed to save review", "error");
    } finally {
      setSubmitting(false);
    }
  };

  /* ================= EDIT / DELETE ================= */
  const editReview = (r) => {
    setFormData({
      name: r.name,
      rating: r.rating,
      comment: r.comment,
      image: null,
    });
    setPreviewImage(null);
    setCurrentReviewId(r._id);
    setIsEditing(true);
  };

  const deleteReview = async (id) => {
    const ok = await Swal.fire({
      title: "Delete review?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
    });
    if (!ok.isConfirmed) return;

    await axios.delete(
      `http://31.97.206.144:9124/api/reviews/deletereview/${id}`
    );
    Swal.fire("Deleted", "Review removed", "success");
    fetchReviews();
  };

  /* ================= STAR RENDER ================= */
  const renderStars = (rating) =>
    [...Array(5)].map((_, i) => (
      <FaStar
        key={i}
        className={i < rating ? "text-yellow-400" : "text-gray-300"}
      />
    ));

  /* ================= UI ================= */
  return (
    <div
      className={`min-h-screen p-6 ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-800"
      }`}
    >
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Reviews Management</h1>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className={`p-6 rounded-xl shadow ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <h2 className="font-semibold mb-4">
            {isEditing ? "Edit Review" : "Add Review"}
          </h2>

          <input
            name="name"
            placeholder="Customer Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full p-3 mb-3 text-white rounded border dark:bg-gray-900 dark:border-gray-700"
          />

          <select
            name="rating"
            value={formData.rating}
            onChange={handleChange}
            className="w-full p-3 mb-3 text-white rounded border dark:bg-gray-900 dark:border-gray-700"
          >
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>
                {r} Stars
              </option>
            ))}
          </select>

          <textarea
            name="comment"
            rows={3}
            placeholder="Comment"
            value={formData.comment}
            onChange={handleChange}
            required
            className="w-full p-3 mb-3 text-white rounded border dark:bg-gray-900 dark:border-gray-700"
          />

          <input
            type="file"
            accept="image/*"
            onChange={handleImage}
            className="mb-3"
            required={!isEditing}
          />

          {previewImage && (
            <img
              src={previewImage}
              className="w-24 h-24 rounded-full object-cover mb-3"
            />
          )}

          <div className="flex justify-end gap-3">
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-500 text-white rounded"
              >
                Cancel
              </button>
            )}
            <button
              disabled={submitting}
              className="px-6 py-2 bg-indigo-600 text-white rounded"
            >
              {submitting ? "Saving..." : "Save Review"}
            </button>
          </div>
        </form>

        {/* LIST */}
        <div
          className={`p-6 rounded-xl shadow ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <h2 className="font-semibold mb-4">Customer Reviews</h2>

          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => (
                <div
                  key={r._id}
                  className="border rounded-lg p-4 flex gap-4"
                >
                  {r.image && (
                    <img
                      src={`http://31.97.206.144:9124${r.image}`}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                  )}

                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <h4 className="font-semibold">{r.name}</h4>
                        <div className="flex items-center gap-1">
                          {renderStars(r.rating)}
                          <span className="text-sm text-gray-500">
                            {r.rating}.0
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => editReview(r)}
                          className="text-yellow-500"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => deleteReview(r._id)}
                          className="text-red-500"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>

                    <p className="text-sm mt-2">{r.comment}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reviews;
