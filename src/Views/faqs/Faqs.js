import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaSave,
  FaTimes,
  FaMoon,
  FaSun,
} from "react-icons/fa";

const API_URL = "http://31.97.206.144:9124/api/admin";

const Faqs = ( {darkMode} ) => {

  const [faqs, setFaqs] = useState([]);
  const [faqImage, setFaqImage] = useState(null);

  const [newFaqs, setNewFaqs] = useState([{ question: "", answer: "" }]);
  const [editingFaq, setEditingFaq] = useState(null);

  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH ================= */
  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      const res = await axios.get(`${API_URL}/getallfaqs`);
      setFaqs(res.data.data || []);
      setFaqImage(res.data.faqImage || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= CREATE ================= */
  const handleFaqChange = (i, field, value) => {
    const updated = [...newFaqs];
    updated[i][field] = value;
    setNewFaqs(updated);
  };

  const addMoreFaq = () =>
    setNewFaqs([...newFaqs, { question: "", answer: "" }]);

  const removeFaqInput = (i) =>
    setNewFaqs(newFaqs.filter((_, index) => index !== i));

  const handleSubmit = async () => {
    const data = new FormData();
    data.append("faqs", JSON.stringify(newFaqs));
    if (imageFile) data.append("image", imageFile);

    try {
      await axios.post(`${API_URL}/createfaq`, data);
      Swal.fire("Success", "FAQs created successfully", "success");
      setNewFaqs([{ question: "", answer: "" }]);
      setImageFile(null);
      fetchFAQs();
    } catch {
      Swal.fire("Error", "Failed to create FAQs", "error");
    }
  };

  /* ================= UPDATE ================= */
  const handleUpdate = async () => {
    try {
      await axios.put(`${API_URL}/updatefaq/${editingFaq._id}`, {
        question: editingFaq.question,
        answer: editingFaq.answer,
      });
      Swal.fire("Updated", "FAQ updated successfully", "success");
      setEditingFaq(null);
      fetchFAQs();
    } catch {
      Swal.fire("Error", "Update failed", "error");
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    const ok = await Swal.fire({
      title: "Delete FAQ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
    });

    if (!ok.isConfirmed) return;

    await axios.delete(`${API_URL}/deletefaq/${id}`);
    fetchFAQs();
    Swal.fire("Deleted", "FAQ removed", "success");
  };

  const handleDeleteImage = async () => {
    await axios.delete(`${API_URL}/faq-image`);
    fetchFAQs();
    Swal.fire("Deleted", "FAQ image removed", "success");
  };

  /* ================= UI ================= */
  return (
    <div
      className={`min-h-screen p-6 transition ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-800"
      }`}
    >
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">FAQ Management</h1>
      </div>

      {/* IMAGE */}
      {faqImage && (
        <div
          className={`p-4 rounded-xl mb-6 flex items-center gap-4 ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <img
            src={`http://31.97.206.144:9124${faqImage}`}
            alt="FAQ"
            className="w-40 rounded-lg"
          />
          <button
            onClick={handleDeleteImage}
            className="px-4 py-2 bg-red-600 text-white rounded-lg"
          >
            <FaTrash className="inline mr-2" />
            Delete Image
          </button>
        </div>
      )}

      {/* CREATE */}
      <div
        className={`p-6 rounded-xl shadow mb-8 ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        <h2 className="font-semibold mb-4">Add FAQs</h2>

        <input
          type="file"
          className="mb-4"
          onChange={(e) => setImageFile(e.target.files[0])}
        />

        {newFaqs.map((faq, i) => (
          <div key={i} className="mb-4">
            <input
              placeholder="Question"
              className="w-full p-2 mb-2 rounded border dark:bg-gray-900 dark:border-gray-700"
              value={faq.question}
              onChange={(e) =>
                handleFaqChange(i, "question", e.target.value)
              }
            />
            <textarea
              placeholder="Answer"
              rows={2}
              className="w-full p-2 rounded border dark:bg-gray-900 dark:border-gray-700"
              value={faq.answer}
              onChange={(e) =>
                handleFaqChange(i, "answer", e.target.value)
              }
            />
            {i > 0 && (
              <button
                onClick={() => removeFaqInput(i)}
                className="mt-2 text-red-500 text-sm"
              >
                <FaTrash className="inline mr-1" />
                Remove
              </button>
            )}
          </div>
        ))}

        <div className="flex gap-3">
          <button
            onClick={addMoreFaq}
            className="px-4 py-2 bg-gray-500 text-white rounded"
          >
            <FaPlus className="inline mr-2" />
            Add More
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-indigo-600 text-white rounded"
          >
            <FaSave className="inline mr-2" />
            Submit FAQs
          </button>
        </div>
      </div>

      {/* LIST */}
      <h2 className="font-semibold mb-4">All FAQs</h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div
              key={faq._id}
              className={`p-4 rounded-xl shadow ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              {editingFaq?._id === faq._id ? (
                <>
                  <input
                    className="w-full p-2 mb-2 rounded border dark:bg-gray-900 dark:border-gray-700"
                    value={editingFaq.question}
                    onChange={(e) =>
                      setEditingFaq({
                        ...editingFaq,
                        question: e.target.value,
                      })
                    }
                  />
                  <textarea
                    className="w-full p-2 mb-2 rounded border dark:bg-gray-900 dark:border-gray-700"
                    value={editingFaq.answer}
                    onChange={(e) =>
                      setEditingFaq({
                        ...editingFaq,
                        answer: e.target.value,
                      })
                    }
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdate}
                      className="px-4 py-2 bg-green-600 text-white rounded"
                    >
                      <FaSave />
                    </button>
                    <button
                      onClick={() => setEditingFaq(null)}
                      className="px-4 py-2 bg-gray-500 text-white rounded"
                    >
                      <FaTimes />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="font-semibold">{faq.question}</h3>
                  <p className="text-sm text-gray-400">{faq.answer}</p>
                  <div className="mt-3 flex gap-3">
                    <button
                      onClick={() => setEditingFaq(faq)}
                      className="text-yellow-400"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(faq._id)}
                      className="text-red-500"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Faqs;
