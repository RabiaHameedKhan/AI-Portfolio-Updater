import fs from "fs";
import path from "path";
import formidable from "formidable";

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const form = formidable({
      uploadDir: path.join(process.cwd(), "public/images"),
      keepExtensions: true,
      multiples: false,
    });

    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    const name = fields.name?.[0];
    const link = fields.link?.[0];
    const description = fields.description?.[0] || "";

    if (!name || !link) {
      return res.status(400).json({ message: "Project name and link required" });
    }

    // ===== SAVE IMAGE LOCALLY =====
    let imagePath = "";

    if (files.image && files.image.length > 0) {
      const file = files.image[0];
      const oldPath = file.filepath;
      const fileName = `${Date.now()}-${file.originalFilename}`;
      const newPath = path.join(process.cwd(), "public/images", fileName);

      fs.renameSync(oldPath, newPath);
      imagePath = `./images/${fileName}`;
    }

    

    // ===== SAVE LOCALLY TO JSON =====
    const projectsPath = path.join(process.cwd(), "data/projects.json");
    let projects = [];

    if (fs.existsSync(projectsPath)) {
      const fileData = fs.readFileSync(projectsPath, "utf8");
      projects = fileData ? JSON.parse(fileData) : [];
    }

    projects.push({ name, link, description, image: imagePath });

    fs.writeFileSync(
      projectsPath,
      JSON.stringify(projects, null, 2),
      "utf8"
    );

    // ===== GITHUB AUTOMATION =====
    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;

    const githubRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/index.html`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!githubRes.ok) {
      throw new Error("Failed to fetch index.html from GitHub");
    }

    const githubData = await githubRes.json();
    const decodedHTML = Buffer.from(
      githubData.content,
      "base64"
    ).toString("utf8");

    // ===== UPLOAD IMAGE TO GITHUB =====
let githubImageURL = "";

if (imagePath) {
  const imageContent = fs.readFileSync(path.join(process.cwd(), "public/images", path.basename(imagePath)), { encoding: "base64" });
  const githubImagePath = `images/${path.basename(imagePath)}`; // root images folder in repo

  // Check if image already exists
  const imageRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${githubImagePath}`,
    {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    }
  );

  let sha;
  if (imageRes.ok) {
    const existingImageData = await imageRes.json();
    sha = existingImageData.sha; // update existing image
  }

  // Upload / update image
  const uploadRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${githubImagePath}`,
    {
      method: "PUT",
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
      body: JSON.stringify({
        message: `Add/update image for ${name}`,
        content: imageContent,
        sha,
      }),
    }
  );

  if (!uploadRes.ok) {
    throw new Error("Failed to upload image to GitHub");
  }

  // GitHub raw URL
  githubImageURL = `https://raw.githubusercontent.com/${owner}/${repo}/main/${githubImagePath}`;
}

    // ===== BUILD NEW PROJECT CARD (MATCH YOUR STRUCTURE EXACTLY) =====
    const newProjectCard = `
                <!--${name.toUpperCase()}-->
                <div class="card">
                    <div class="box">
                        <img src="${imagePath}" alt="">
                        <div class="text">${name}</div>
                        <p><a target="_blank" href="${link}">
                             <br><u class="underline">Click here to see!</u></a></p>
                    </div>
                </div>
    `;

    // ===== INSERT BEFORE CAROUSEL CLOSING DIV =====
    // Find carousel container
const carouselStart = decodedHTML.indexOf('<div class="carousel owl-carousel">');

if (carouselStart === -1) {
  throw new Error("Carousel section not found in index.html");
}

// Find position right after opening carousel div
const insertPosition = decodedHTML.indexOf(
  '>',
  carouselStart
) + 1;

// Insert new project card immediately after carousel opens
const updatedHTML =
  decodedHTML.slice(0, insertPosition) +
  newProjectCard +
  decodedHTML.slice(insertPosition);

    const encodedContent = Buffer.from(updatedHTML).toString("base64");

    const commitRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/index.html`,
      {
        method: "PUT",
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
        body: JSON.stringify({
          message: `${name} project updated`,
          content: encodedContent,
          sha: githubData.sha,
        }),
      }
    );

    if (!commitRes.ok) {
      throw new Error("Failed to commit updated index.html");
    }

    return res.status(200).json({
      message: "Project saved locally & GitHub updated successfully 🚀",
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error",
      error: error.message,
    });
  }
}