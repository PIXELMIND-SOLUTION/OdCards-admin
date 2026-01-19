import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FaTrash, FaEye, FaMoon, FaSun } from "react-icons/fa";

const ContactUs = ( {darkMode} ) => {

  /* ================= CONTACT INFO ================= */
  const [contactData, setContactData] = useState({
    phone: "",
    email: "",
    address: "",
  });
  const [currentContactId, setCurrentContactId] = useState(null);
  const [loadingContact, setLoadingContact] = useState(true);

  /* ================= SUBMISSIONS ================= */
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  const [selectedSubmission, setSelectedSubmission] = useState(null);

  /* ================= FETCH ================= */
  useEffect(() => {
    fetchContact();
    fetchSubmissions();
  }, []);

  const fetchContact = async () => {
    try {
      const res = await axios.get(
        "http://31.97.206.144:9124/api/contactus/get"
      );
      if (res.data.data?.length) {
        const c = res.data.data[0];
        setContactData({
          phone: c.phone,
          email: c.email,
          address: c.address,
        });
        setCurrentContactId(c._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingContact(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const res = await axios.get(
        "http://31.97.206.144:9124/api/contactus/submissions"
      );
      setSubmissions(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  /* ================= CONTACT SAVE ================= */
  const submitContact = async (e) => {
    e.preventDefault();
    try {
      if (currentContactId) {
        await axios.put(
          `http://31.97.206.144:9124/api/contactus/update/${currentContactId}`,
          contactData
        );
      } else {
        await axios.post(
          "http://31.97.206.144:9124/api/contactus/create",
          contactData
        );
      }
      Swal.fire("Success", "Contact info saved", "success");
      fetchContact();
    } catch {
      Swal.fire("Error", "Failed to save contact info", "error");
    }
  };

  /* ================= DELETE SUBMISSION ================= */
  const deleteSubmission = async (id) => {
    const ok = await Swal.fire({
      title: "Delete submission?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
    });

    if (!ok.isConfirmed) return;

    await axios.delete(
      `http://31.97.206.144:9124/api/contactus/submissions/${id}`
    );
    Swal.fire("Deleted", "Submission removed", "success");
    fetchSubmissions();
  };

  /* ================= PAGINATION ================= */
  const totalPages = Math.ceil(submissions.length / perPage);
  const start = (currentPage - 1) * perPage;
  const currentSubmissions = submissions.slice(start, start + perPage);

  /* ================= UI ================= */
  return (
    <div
      className={`min-h-screen p-6 ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-800"
      }`}
    >
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Contact Us Management</h1>
      </div>

      {/* CONTACT INFO */}
      <div
        className={`p-6 rounded-xl shadow mb-8 ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        <h2 className="font-semibold mb-4">Contact Information</h2>

        {loadingContact ? (
          <p>Loading...</p>
        ) : (
          <form onSubmit={submitContact} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={contactData.email}
              onChange={(e) =>
                setContactData({ ...contactData, email: e.target.value })
              }
              className="w-full p-3 rounded border dark:bg-gray-900 dark:border-gray-700 text-white"
              required
            />

            <input
              type="tel"
              placeholder="Phone"
              value={contactData.phone}
              onChange={(e) =>
                setContactData({ ...contactData, phone: e.target.value })
              }
              className="w-full p-3 rounded border dark:bg-gray-900 dark:border-gray-700 text-white"
              required
            />

            <textarea
              placeholder="Address"
              rows={3}
              value={contactData.address}
              onChange={(e) =>
                setContactData({ ...contactData, address: e.target.value })
              }
              className="w-full p-3 rounded border dark:bg-gray-900 dark:border-gray-700 text-white"
              required
            />

            <div className="text-right">
              <button className="px-6 py-2 bg-indigo-600 text-white rounded">
                Save Contact Info
              </button>
            </div>
          </form>
        )}
      </div>

      {/* SUBMISSIONS */}
      <div
        className={`p-6 rounded-xl shadow ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        <h2 className="font-semibold mb-4">Contact Form Submissions</h2>

        {loadingSubmissions ? (
          <p>Loading...</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead
                  className={`${
                    darkMode ? "bg-gray-700" : "bg-gray-100"
                  }`}
                >
                  <tr>
                    <th className="p-3">Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Message</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentSubmissions.map((s) => (
                    <tr
                      key={s._id}
                      className="border-t hover:bg-gray-50 dark:hover:bg-gray-700 hover:cursor-pointer hover:text-white"
                    >
                      <td className="p-3">{s.name}</td>
                      <td>{s.email}</td>
                      <td>{s.number}</td>
                      <td>
                        {s.message.length > 25
                          ? s.message.slice(0, 25) + "..."
                          : s.message}
                      </td>
                      <td>{s.formattedDate}</td>
                      <td>{s.formattedTime}</td>
                      <td className="text-center space-x-3">
                        <button
                          onClick={() => setSelectedSubmission(s)}
                          className="text-blue-500"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => deleteSubmission(s._id)}
                          className="text-red-500"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            <div className="flex justify-center gap-2 mt-4">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Prev
              </button>
              <span className="px-3 py-1">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>

      {/* MODAL */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg">
            <h3 className="font-semibold mb-3">Submission Details</h3>
            <p><strong>Name:</strong> {selectedSubmission.name}</p>
            <p><strong>Email:</strong> {selectedSubmission.email}</p>
            <p><strong>Phone:</strong> {selectedSubmission.number}</p>
            <p className="mt-2"><strong>Message:</strong></p>
            <p className="text-sm">{selectedSubmission.message}</p>

            <div className="text-right mt-4">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactUs;
