import { useState } from "react";
import { motion } from "framer-motion";

export default function Home() {
  const [formData, setFormData] = useState({
    name: "",
    link: "",
    description: "",
    image: null,
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setFormData({ ...formData, image: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataObj = new FormData();
    formDataObj.append("name", formData.name);
    formDataObj.append("link", formData.link);
    formDataObj.append("description", formData.description);
    formDataObj.append("image", formData.image);

    try {
      const res = await fetch("/api/addProject", {
        method: "POST",
        body: formDataObj,
      });

      const data = await res.json();

      if (res.ok) {
        alert("Project added successfully!");
        setFormData({ name: "", link: "", description: "", image: null });
      } else {
        alert("Failed to add project: " + data.message);
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while adding the project.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* NAVBAR */}
      <div className="fixed top-0 left-0 w-full bg-white/95 backdrop-blur-md shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center">
          <h1 className="text-xl font-bold text-blue-900">My AI Portfolio Updater</h1>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex min-h-screen pt-20">

        {/* LEFT SIDE - TEXT / MOTIVATION */}
        <motion.div
          initial={{ x: -80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="w-1/2 relative flex items-center justify-center bg-gradient-to-br from-blue-900 to-gray-900 text-white p-16"
        >
          <div className="max-w-md text-left">
            <h1 className="text-5xl font-extrabold leading-tight mb-6">
              Congratulations, Rabia
            </h1>

            <p className="text-lg text-gray-200 mb-6">
              You’ve completed another milestone. Each project you add demonstrates your skills and growth.
            </p>

            <div className="border-l-4 border-white pl-4 text-gray-300 italic">
              “Consistency creates mastery.”
            </div>

            <div className="mt-10 text-sm uppercase tracking-widest text-gray-400">
              AI Portfolio Updater
            </div>
          </div>
        </motion.div>

        {/* RIGHT SIDE - FORM */}
        <motion.div
          initial={{ x: 80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="w-1/2 flex items-center justify-center p-16"
        >
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl p-10 border border-gray-100">

            <h2 className="text-4xl font-bold text-gray-800 mb-3">
              Add New Project
            </h2>
            <p className="text-gray-500 mb-8">
              Keep your portfolio updated effortlessly.
            </p>

            <form className="space-y-6" onSubmit={handleSubmit}>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-black rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-900 focus:outline-none transition"
                  
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Live Link
                </label>
                <input
                  type="text"
                  name="link"
                  value={formData.link}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-black rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-900 focus:outline-none transition"
                  
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Image
                </label>
                <input
                  type="file"
                  name="image"
                  onChange={handleChange}
                  className="w-full text-sm text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-3 text-black rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-900 focus:outline-none transition"
                  
                ></textarea>
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-900 text-white font-semibold shadow-md hover:bg-blue-800 transition"
              >
                Update Portfolio
              </motion.button>

            </form>
          </div>
        </motion.div>

      </div>
    </div>
  );
}