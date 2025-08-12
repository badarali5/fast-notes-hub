"use client";
import { useState } from "react"; 
import { supabase } from "@/lib/supabase";

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [semester, setSemester] = useState("");
  const [type, setType] = useState("");
  const [fileInputKey, setFileInputKey] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);

  const handleUpload = async () => {

    if (files.length === 0) {
      alert("Please select at least one file first");
      return;
    }

    if (!subject || !semester || !type) {
      alert("Please fill in all required fields");
      return;
    }

    // Validate that the type is one of the expected values
    const validTypes = ['notes', 'papers', 'slides'];
    if (!validTypes.includes(type)) {
      alert("Please select a valid type (Notes, Papers, or Slides)");
      return;
    }

    // Validate that the subject matches the expected format
    const validSubjects = [
      'NS1001', 'MT1003', 'SS1012', 'SS1013', 'CL1000', 'CS1002', // Semester 1
      'SS2043', 'EE1005', 'SS1014', 'SS1007', 'MT1008', 'CS1004', // Semester 2
      'EE2003', 'CS2001', 'CS1005', 'SE1001', 'MT1004', 'SSX21',  // Semester 3
      'CS2005', 'CS2006', 'SS1015', 'MT2005', 'SE2004', 'SE2001', // Semester 4
      'AI2002', 'CS2009', 'SE3004', 'SE3002', 'SS2012'            // Semester 5
    ];
    if (!validSubjects.includes(subject)) {
      alert("Please select a valid subject");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setCurrentFileIndex(0);

    try {
      // 0. Check if uploads table exists and has correct structure
      console.log("🔍 Checking database table structure...");
      const { data: tableCheck, error: tableError } = await supabase
        .from("uploads")
        .select("id, title, description, subject, semester, type, file_name, url, created_at")
        .limit(1);

      console.log("🔍 Table structure check result:", tableCheck);
      
      if (tableError) {
        console.error("❌ Table structure check failed:", tableError);
        console.error("This might indicate the uploads table doesn't exist or has wrong structure");
        alert("Database table issue: " + tableError.message);
        setIsUploading(false);
        setUploadProgress(0);
        return;
      } else {
        console.log("✅ Table structure check passed");
      }

      const totalFiles = files.length;
      let successfulUploads = 0;
      let failedUploads = 0;
      const failedFiles: string[] = [];

      // Upload each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setCurrentFileIndex(i + 1);
        
        console.log(`📤 Uploading file ${i + 1}/${totalFiles}: ${file.name}`);
        
        try {
          // 1. Upload to Supabase Storage
          const progressPerFile = 90 / totalFiles; // Reserve 10% for completion
          const startProgress = (i * progressPerFile);
          setUploadProgress(startProgress);
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("materials")
            .upload(`uploads/${file.name}`, file);

          if (uploadError) {
            console.error(`Storage upload error for ${file.name}:`, uploadError);
            failedUploads++;
            failedFiles.push(`${file.name} (Storage error: ${uploadError.message})`);
            continue;
          }

          // 2. Get Public URL from Supabase
          const { data: publicUrlData } = supabase.storage
            .from("materials")
            .getPublicUrl(`uploads/${file.name}`);

          const publicUrl = publicUrlData.publicUrl;

          // 3. Insert into Supabase Table
          const fileData = {
            title: file.name,
            description,
            subject,
            semester,
            type,
            file_name: file.name,
            url: publicUrl,
          };
          
          console.log(`Inserting file with categorization:`, fileData);
          
          const { data: insertData, error: insertError } = await supabase.from("uploads").insert([fileData]);
          
          if (insertError) {
            console.error(`❌ Database insert failed for ${file.name}:`, insertError);
            failedUploads++;
            failedFiles.push(`${file.name} (Database error: ${insertError.message})`);
          } else {
            console.log(`✅ Successfully uploaded ${file.name}`);
            successfulUploads++;
          }

          setUploadProgress(startProgress + progressPerFile);
          
        } catch (error) {
          console.error(`❌ Error uploading ${file.name}:`, error);
          failedUploads++;
          failedFiles.push(`${file.name} (Unknown error)`);
        }
      }

      setUploadProgress(100);
      
      // Show results
      let resultMessage = `📊 Upload Complete!\n\n`;
      resultMessage += `✅ Successfully uploaded: ${successfulUploads} files\n`;
      resultMessage += `❌ Failed uploads: ${failedUploads} files\n`;
      resultMessage += `📚 Subject: ${subject}\n`;
      resultMessage += `📖 Type: ${type}\n`;
      resultMessage += `🎓 Semester: ${semester}\n\n`;
      
      if (failedFiles.length > 0) {
        resultMessage += `Failed files:\n${failedFiles.join('\n')}`;
      }
      
      if (successfulUploads > 0) {
        resultMessage += `\n\nYour files have been categorized and are now available in the ${subject} section under ${type}.`;
      }
      
      alert(resultMessage);
      
      // Optionally redirect to the subject page to see the uploaded files
      if (successfulUploads > 0 && confirm("Would you like to view your uploaded files in the subject section?")) {
        window.location.href = `/subject/${subject.toLowerCase()}?semester=${semester}`;
      }
      
      // Reset form
      setFiles([]);
      setDescription("");
      setSubject("");
      setSemester("");
      setType("");
      setFileInputKey(prev => prev + 1);
      setIsUploading(false);
      setUploadProgress(0);
      setCurrentFileIndex(0);
      
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed. Please try again.");
      setIsUploading(false);
      setUploadProgress(0);
      setCurrentFileIndex(0);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(selectedFiles);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <div className="dark min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-md w-full mx-auto mt-10 p-6 border border-gray-300 dark:border-gray-700 rounded-lg shadow-md bg-white dark:bg-gray-900">
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-900 dark:text-gray-100">Upload Documents</h2>
        
        <div className="space-y-4">
          <input 
            key={fileInputKey}
            type="file" 
            multiple
            disabled={isUploading}
            onChange={handleFileChange} 
            className={`w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 
              text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer bg-white dark:bg-gray-900 dark:text-gray-100 ${
              isUploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          />
          
          {files.length > 0 && (
            <div className="p-3 bg-blue-50 dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-gray-700">
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                <strong>Selected files ({files.length}):</strong>
              </p>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between text-xs text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-gray-700 p-2 rounded">
                    <span className="truncate flex-1">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      disabled={isUploading}
                      className="ml-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-300 mt-2">
                All files will use the same subject, semester, and type settings below
              </p>
            </div>
          )}

          <input 
            type="text" 
            placeholder="Description (applied to all files)" 
            value={description}
            disabled={isUploading}
            onChange={(e) => setDescription(e.target.value)} 
            className={`w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm bg-white dark:bg-gray-900 dark:text-gray-100 ${
              isUploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          />
          <select 
            value={subject}
            disabled={isUploading}
            onChange={(e) => setSubject(e.target.value)} 
            className={`w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm bg-white dark:bg-gray-900 dark:text-gray-100 ${
              isUploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <option value="">Select Subject</option>
            <optgroup label="Semester 1">
              <option value="NS1001">NS1001 - Applied Physics</option>
              <option value="MT1003">MT1003 - Calculus and Analytical Geometry</option>
              <option value="SS1012">SS1012 - Functional English</option>
              <option value="SS1013">SS1013 - Ideology and Constitution of Pakistan</option>
              <option value="CL1000">CL1000 - Introduction to Information and Communication Technology</option>
              <option value="CS1002">CS1002 - Programming Fundamentals</option>
            </optgroup>
            <optgroup label="Semester 2">
              <option value="CS1004">CS1004 - Object Oriented Programming</option>
              <option value="MT1008">MT1008 - Multivariable Calculus</option>
              <option value="EE1005">EE1005 - Digital Logic Design</option>
              <option value="SS1014">SS1014 - Expository Writing</option>
              <option value="SS1007">SS1007 - Islamic Studies/Ethics</option>
              <option value="SS2043">SS2043 - Civics and Community Engagement</option>
            </optgroup>
            <optgroup label="Semester 3">
              <option value="EE2003">EE2003 - Computer Organization and Assembly Language</option>
              <option value="CS2001">CS2001 - Data Structures and Algorithms</option>
              <option value="CS1005">CS1005 - Discrete Structures</option>
              <option value="SE1001">SE1001 - Introduction to Software Engineering</option>
              <option value="MT1004">MT1004 - Linear Algebra</option>
              <option value="SSX21">SSX21 - Social Science Elective - I</option>
            </optgroup>
            <optgroup label="Semester 4">
              <option value="CS2005">CS2005 - Database Systems</option>
              <option value="CS2006">CS2006 - Operating Systems</option>
              <option value="MT2005">MT2005 - Probability and Statistics</option>
              <option value="SE2004">SE2004 - Software Design and Architecture</option>
              <option value="SE2001">SE2001 - Software Requirements Engineering</option>
            </optgroup>
          </select>
          <select 
            value={semester}
            disabled={isUploading}
            onChange={(e) => setSemester(e.target.value)} 
            className={`w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm bg-white dark:bg-gray-900 dark:text-gray-100 ${
              isUploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <option value="">Select Semester</option>
            <option value="1">Semester 1 </option>
            <option value="2">Semester 2 </option>
            <option value="3">Semester 3 </option>
            <option value="4">Semester 4 </option>
          </select>
          <select 
            value={type}
            disabled={isUploading}
            onChange={(e) => setType(e.target.value)} 
            className={`w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm bg-white dark:bg-gray-900 dark:text-gray-100 ${
              isUploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <option value="">Select Type</option>
            <option value="notes">Notes</option>
            <option value="papers">Papers</option>
            <option value="slides">Slides</option>
          </select>

          <button 
            onClick={handleUpload} 
            disabled={isUploading || files.length === 0}
            className={`w-full py-2 rounded transition duration-200 cursor-pointer ${
              isUploading || files.length === 0
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isUploading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Uploading... {currentFileIndex}/{files.length} ({uploadProgress.toFixed(0)}%)</span>
              </div>
            ) : (
              `Upload ${files.length > 0 ? `${files.length} file${files.length > 1 ? 's' : ''}` : ''}`
            )}
          </button>
          
          {isUploading && (
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
