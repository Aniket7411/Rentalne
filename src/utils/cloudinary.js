const CLOUDINARY_CONFIG = {
  CLOUD_NAME: "defgskoxv",
  UPLOAD_PRESET: "x01b8cid",
  FOLDER: "STJ"
};

/**
 * Upload a single file to Cloudinary
 * @param {File} file - The file to upload
 * @returns {Promise<string|null>} - Returns the secure URL or null on error
 */
export default async function uploadFileToCloudinary(file) {
  try {
    if (!file) {
      throw new Error("No file selected");
    }

    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", CLOUDINARY_CONFIG.UPLOAD_PRESET);
    data.append("cloud_name", CLOUDINARY_CONFIG.CLOUD_NAME);
    data.append("folder", CLOUDINARY_CONFIG.FOLDER);

    // Determine resource type based on file MIME type
    let resource_Type = "auto"; // Auto-detect type
    if (file.type.startsWith("image/")) {
      resource_Type = "image";
    } else if (file.type.startsWith("video/")) {
      resource_Type = "video";
    } else {
      resource_Type = "raw"; // For PDFs, docs, zip, etc.
    }

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.CLOUD_NAME}/${resource_Type}/upload`,
      {
        method: "POST",
        body: data,
      }
    );

    const res = await response.json();

    if (!response.ok) {
      throw new Error(res.error?.message || "Upload failed");
    }

    return res.secure_url; // Return Cloudinary file URL
  } catch (error) {
    console.error("Error uploading file:", error);
    return null;
  }
}

/**
 * Upload multiple files to Cloudinary
 * @param {File[]} files - Array of files to upload
 * @returns {Promise<string[]>} - Returns array of secure URLs (null for failed uploads)
 */
export async function uploadMultipleFilesToCloudinary(files) {
  try {
    if (!files || files.length === 0) {
      return [];
    }

    const uploadPromises = files.map(file => uploadFileToCloudinary(file));
    const urls = await Promise.all(uploadPromises);
    
    // Filter out null values (failed uploads)
    return urls.filter(url => url !== null);
  } catch (error) {
    console.error("Error uploading multiple files:", error);
    return [];
  }
}

