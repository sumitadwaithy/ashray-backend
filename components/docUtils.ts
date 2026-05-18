import { Doc } from '../types';

export const getDocUrl = (doc: Doc) => {
  if (!doc) return '';

  // 1. If we have local fileData with a data URL prefix, use it immediately
  if (doc.fileData && doc.fileData.startsWith('data:')) {
    return doc.fileData;
  }

  // 2. Fallback for raw base64 data without prefix - check this BEFORE API serving
  if (doc.fileData && doc.fileData.length > 0) {
    const prefix = doc.type === 'pdf' || (doc.name && doc.name.toLowerCase().endsWith('.pdf')) 
      ? 'data:application/pdf;base64,' 
      : 'data:image/jpeg;base64,';
    return prefix + doc.fileData;
  }

  // 3. If it's a "real" document ID, use the serving API
  if (doc.id && String(doc.id).startsWith('doc_')) {
    return `/api/doc/serve/${encodeURIComponent(String(doc.id))}`;
  }

  // 4. Ultimate fallback to search by name
  if (doc.name) {
    return `/api/doc/serve/${encodeURIComponent(String(doc.id || doc.name))}`;
  }

  return '';
};

export const handleDownloadDoc = async (doc: Doc) => {
  const url = getDocUrl(doc);
  
  if (url.startsWith('data:')) {
    const link = document.createElement('a');
    link.href = url;
    link.download = doc.name || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = doc.name || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Error downloading document:", err);
      alert(`Error downloading document: ${doc.name}`);
    }
  }
};
