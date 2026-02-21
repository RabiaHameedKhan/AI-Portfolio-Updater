import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [formData, setFormData] = useState({
    name: "",
    link: "",
    description: "",
    image: null,
  });

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [showToast, setShowToast] = useState(false);

  // Handle input change
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setFormData({ ...formData, image: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataObj = new FormData();
    formDataObj.append("name", formData.name);
    formDataObj.append("link", formData.link);
    formDataObj.append("description", formData.description);
    formDataObj.append("image", formData.image);

    setLoading(true);
    setProgress(0);
    setStatusText("Updating code...");

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 30) {
          setStatusText("Updating code...");
          return prev + 5;
        }
        if (prev < 70) {
          setStatusText("Committing changes to GitHub...");
          return prev + 3;
        }
        if (prev < 95) {
          setStatusText("Deploying...");
          return prev + 1;
        }
        return prev;
      });
    }, 200);

    try {
      const res = await fetch("/api/addProject", {
        method: "POST",
        body: formDataObj,
      });

      clearInterval(interval);

      if (!res.ok) throw new Error("Failed");

      setProgress(100);
      setStatusText("Deployment complete");

      setTimeout(() => {
        setLoading(false);
        setShowToast(true);
        setFormData({ name: "", link: "", description: "", image: null });
      }, 800);
    } catch (error) {
      clearInterval(interval);
      setLoading(false);
      alert("Something went wrong.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* NAVBAR */}
      <div className="fixed top-0 left-0 w-full bg-white shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-xl font-bold text-blue-900">
            My AI Portfolio Updater
          </h1>
        </div>
      </div>

      {/* MAIN */}
      <div className="flex flex-col md:flex-row min-h-screen pt-20">

        {/* LEFT SIDE */}
        <div className="md:w-1/2 bg-gradient-to-br from-blue-900 to-gray-900 text-white p-10 flex items-center justify-center">
          <div className="max-w-md text-left">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6">
              Congratulations, Rabia
            </h1>
            <p className="text-gray-200 mb-6">
              Every project you add strengthens your professional presence.
              Keep building. Keep shipping.
            </p>
            <div className="border-l-4 border-white pl-4 italic text-gray-300">
              Consistency creates mastery.
            </div>
          </div>
        </div>

        {/* RIGHT SIDE FORM */}
        <div className="md:w-1/2 p-8 flex items-center justify-center">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl p-8 border border-gray-100">

            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Add New Project
            </h2>
            <p className="text-gray-500 mb-6">
              Update your portfolio automatically.
            </p>

            <form className="space-y-5" onSubmit={handleSubmit}>

              <input
                type="text"
                name="name"
                placeholder="Project Name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 text-gray-600 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-900 focus:outline-none"
                required
              />

              <input
                type="text"
                name="link"
                placeholder="Live Link"
                value={formData.link}
                onChange={handleChange}
                className="w-full px-4 py-3 text-gray-600 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-900 focus:outline-none"
                required
              />

              <input
                type="file"
                name="image"
                onChange={handleChange}
                className="w-full text-sm text-gray-600"
                required
              />

              <textarea
                name="description"
                placeholder="Description (Optional)"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-3 text-gray-600 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-900 focus:outline-none"
              ></textarea>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-900 text-white font-semibold hover:bg-blue-800 transition"
              >
                Update Portfolio
              </button>

            </form>
          </div>
        </div>
      </div>

      {/* LOADER */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          >
            <div className="bg-white p-10 rounded-2xl w-96 text-center shadow-xl">
              <h3 className="text-xl font-semibold mb-4">
                Updating Portfolio
              </h3>
              <p className="text-gray-600 mb-4">{statusText}</p>

              <div className="h-2 bg-gray-200 rounded-full">
                <div
                  className="h-2 bg-blue-900 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              <p className="mt-4 text-sm text-gray-500">
                {progress}%
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOAST */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-6 right-6 bg-blue-900 text-white p-6 rounded-xl shadow-xl w-80 z-50"
          >
            <h4 className="font-semibold mb-3">
              Project Successfully Added
            </h4>

            <div className="flex gap-3">
              <button
                onClick={() => setShowToast(false)}
                className="px-3 py-2 bg-white text-blue-900 rounded-md text-sm"
              >
                OK
              </button>

              <a
                href="https://github.com/RabiaHameedKhan/portfolio-test"
                target="_blank"
                className="px-3 py-2 bg-white text-blue-900 rounded-md text-sm text-center"
              >
                View Repository
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}