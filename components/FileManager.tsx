import React, { useState, useEffect } from 'react';
import { Folder, File, Plus, Upload, Trash2, ChevronLeft } from 'lucide-react';
import { dbService } from './../services/db';

interface FileManagerProps {
  // Add props if needed
}

export const FileManager: React.FC<FileManagerProps> = () => {
  const [folders, setFolders] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [currentFolderId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const allFolders = await dbService.getFolders();
      const allFiles = await dbService.getDocs();
      setFolders(allFolders.filter(f => f.parent_id === currentFolderId));
      setFiles(allFiles.filter(f => f.folder_id === currentFolderId));
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    const name = prompt("Enter folder name:");
    if (name) {
      await dbService.saveFolder({ name, parent_id: currentFolderId } as any);
      fetchData();
    }
  };

  const handleDelete = async (id: string, type: 'folder' | 'file') => {
    if (confirm(`Are you sure you want to delete this ${type}?`)) {
      if (type === 'folder') await dbService.deleteFolder(id);
      else await dbService.deleteDoc(id);
      fetchData();
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">File Manager</h1>
        <div className="flex gap-2">
          <button onClick={handleCreateFolder} className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded">
            <Plus size={18} /> New Folder
          </button>
          <button className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded">
            <Upload size={18} /> Upload
          </button>
        </div>
      </div>

      {currentFolderId && (
        <button onClick={() => setCurrentFolderId(null)} className="mb-4 flex items-center gap-1 text-gray-600">
          <ChevronLeft size={18} /> Back
        </button>
      )}

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {folders.map(folder => (
            <div key={folder.id} className="border p-4 rounded flex items-center justify-between cursor-pointer hover:bg-gray-50" onClick={() => setCurrentFolderId(folder.id)}>
              <div className="flex items-center gap-2">
                <Folder className="text-yellow-500" /> {folder.name}
              </div>
              <Trash2 size={18} className="text-red-500" onClick={(e) => { e.stopPropagation(); handleDelete(folder.id, 'folder'); }} />
            </div>
          ))}
          {files.map(file => (
            <div key={file.id} className="border p-4 rounded flex items-center justify-between">
              <div className="flex items-center gap-2">
                <File className="text-gray-500" /> {file.name}
              </div>
              <Trash2 size={18} className="text-red-500" onClick={() => handleDelete(file.id, 'file')} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
