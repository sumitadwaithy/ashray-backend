import React, { useState, useEffect, useRef } from 'react';
import JSZip from 'jszip';
import { dbService } from '../services/db';
console.log("DEBUG: dbService imported in DataBase.tsx:", dbService);
import { 
  Folder as FolderIcon, 
  File as FileIcon, 
  Search, 
  Plus, 
  Upload, 
  ChevronRight, 
  ChevronDown,
  MoreVertical, 
  Trash2, 
  Edit2, 
  ArrowLeft,
  LayoutGrid,
  List as ListIcon,
  Clock,
  Star,
  HardDrive,
  Printer,
  X,
  Eye,
  Info,
  Download,
  Share2,
  CheckCircle2,
  Circle,
  MoreHorizontal,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Copy,
  ClipboardPaste,
  FolderPlus,
  Scissors,
  Lock,
  Tag,
  Settings,
  Briefcase,
  Shield,
  FileText,
  Image as ImageIcon,
  Music,
  Video,
  Archive,
  Book,
  Calendar,
  CreditCard,
  Database,
  Mail,
  Map,
  MessageSquare,
  Package,
  ShoppingCart,
  User,
  Users,
  Zap
} from 'lucide-react';

import imageCompression from 'browser-image-compression';
import { CentralizedIntelligence } from '../components/CentralizedIntelligence';

interface DocumentFile {
  id: string | number;
  name: string;
  type: string;
  size: number;

  folder_id: string | number | null;
  category_id: string | number | null;
  
  fileData?: string | null;

  is_starred: number;
  is_deleted: number;

  created_at: string;
  updated_at: string;
}

interface Folder {
  id: string | number;
  name: string;
  parent_id: string | number | null;
  category_id: string | number | null;
  icon: string;
  is_starred: number;
  is_deleted: number;
  is_locked: number;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: string | number;
  name: string;
  color: string;
  icon: string;
}

const AVAILABLE_ICONS = {
  Folder: FolderIcon,
  Tag,
  Briefcase,
  Shield,
  FileText,
  ImageIcon,
  Music,
  Video,
  Archive,
  Book,
  Calendar,
  CreditCard,
  Database,
  Mail,
  Map,
  MessageSquare,
  Package,
  ShoppingCart,
  User,
  Users,
  Zap
};

const DynamicIcon = ({ name, className, style }: { name: string, className?: string, style?: React.CSSProperties }) => {
  const Icon = (AVAILABLE_ICONS as any)[name] || FolderIcon;
  return <Icon className={className} style={style} />;
};

type ViewFilter = 'all' | 'recent' | 'starred' | 'trash' | 'category';

interface DataBasePageProps {
  onManageCategories?: () => void;
}

// Helper for robust file to base64 conversion
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = error => reject(error);
  });
};

export default function DataBasePage({ onManageCategories }: DataBasePageProps) {
  const [files, setFiles] = useState<DocumentFile[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [deletedCategories, setDeletedCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [path, setPath] = useState<Folder[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filter, setFilter] = useState<ViewFilter>('all');
  const [selectedItems, setSelectedItems] = useState<{ id: string | number, type: 'file' | 'folder' }[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [isPropertiesModalOpen, setIsPropertiesModalOpen] = useState(false);
  const [itemForProperties, setItemForProperties] = useState<{ item: any, type: 'file' | 'folder' } | null>(null);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [isAssignCategoryModalOpen, setIsAssignCategoryModalOpen] = useState(false);
  const [itemsToCategorize, setItemsToCategorize] = useState<{ id: string | number, type: 'file' | 'folder' }[]>([]);
  const [intelligenceId, setIntelligenceId] = useState<string | null>(null);
  const [toastState, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (toastState) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastState]);
  const [categorySearch, setCategorySearch] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingFile, setEditingFile] = useState<DocumentFile | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFilesForUpload, setSelectedFilesForUpload] = useState<FileList | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressedFiles, setCompressedFiles] = useState<File[]>([]);
  const [uploadCategoryId, setUploadCategoryId] = useState<string | number | null>(null);
  const [uploadFolderId, setUploadFolderId] = useState<string | number | null>(null);
  const [allFolders, setAllFolders] = useState<Folder[]>([]);
  const [allFiles, setAllFiles] = useState<DocumentFile[]>([]);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });
  const [folderForm, setFolderForm] = useState({ name: '', category_id: '' as string | number, parent_id: null as string | number | null, icon: 'Folder' });
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, item: any, type: 'file' | 'folder' | 'category' | 'empty' } | null>(null);
  const [clipboard, setClipboard] = useState<{ id: string | number, type: 'file' | 'folder', action: 'copy' | 'cut' } | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({ key: 'name', direction: 'asc' });
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [totalStorage, setTotalStorage] = useState(0);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const fetchData = async () => {
    try {
      console.log("DEBUG: Attempting to fetch docs and folders...");
      const allDocsResponse = await dbService.getDocs(true);
      const allFoldersResponse = await dbService.getFolders(true);
      
      let allDocs = Array.isArray(allDocsResponse) ? allDocsResponse : [];
      // For DataBase page we ONLY want generic files or virtual reports.
      // We DO NOT want regular ledger documents that belong to a client's profile.
      allDocs = allDocs.filter(f => {
        const isReport = f.type === 'virtual' || f.category === 'REPORT';
        // Hide RAW system reports so they are exclusively replaced by live computed virtualFiles 
        return !isReport;
      });
      const allFolders = Array.isArray(allFoldersResponse) ? allFoldersResponse : [];
      
      console.log(`DEBUG: Total items - Docs: ${allDocs.length}, Folders: ${allFolders.length}`);
      const starredDocs = allDocs.filter(d => d.is_starred);
      const starredFolders = allFolders.filter(f => f.is_starred);
      console.log("DEBUG: Starred items found in raw data - Docs:", starredDocs.map(d => d.name), "Folders:", starredFolders.map(f => f.name));
      
      console.log("DEBUG: Current filter:", filter);
      console.log("DEBUG: Current folder:", currentFolder);

      const parentId = currentFolder ? currentFolder.id?.toString() : null;
      
      let filteredFiles = allDocs;
      let filteredFolders = allFolders;

      if (search) {
        filteredFiles = allDocs.filter(f => 
          (f.name || '').toLowerCase().includes((search || '').toLowerCase()) ||
          ((f as any).clientId || '').toLowerCase().includes((search || '').toLowerCase())
        );
        filteredFolders = allFolders.filter(f => (f.name || '').toLowerCase().includes((search || '').toLowerCase()));
      } else {
        if (filter === 'starred') {
          filteredFiles = allDocs.filter(f => {
            const isEntityDoc = f.clientId || f.staffId || f.kissanId || f.investorId || f.loanId || f.ownerId;
            return f.is_starred && !isEntityDoc;
          });
          filteredFolders = allFolders.filter(f => f.is_starred);
          console.log(`DEBUG: Starred filter applied. Found ${filteredFiles.length} files and ${filteredFolders.length} folders.`);
          if (filteredFolders.length === 0 && allFolders.some(f => f.is_starred)) {
             console.warn("DEBUG: Found some folders with is_starred truthy but filtered result is empty. Truthy folders:", allFolders.filter(f => f.is_starred).map(f => f.id));
          }
        } else if (filter === 'trash') {
          filteredFiles = allDocs.filter(f => {
            const isEntityDoc = f.clientId || f.staffId || f.kissanId || f.investorId || f.loanId || f.ownerId;
            return f.is_deleted && !isEntityDoc;
          });
          filteredFolders = allFolders.filter(f => f.is_deleted);
          console.log("DEBUG: Deleted categories:", deletedCategories);
        } else if (filter === 'recent') {
          const lockedFolderIds = new Set(allFolders.filter(f => f.is_locked).map(f => String(f.id)));
          filteredFiles = [...allDocs]
            .filter(f => {
              const f_folder_id = f.folder_id != null ? String(f.folder_id) : (f.folderId != null ? String(f.folderId) : null);
              const isEntityDoc = f.clientId || f.staffId || f.kissanId || f.investorId || f.loanId || f.ownerId;
              return !lockedFolderIds.has(String(f_folder_id)) && !f.is_deleted && !isEntityDoc;
            })
            .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
          filteredFolders = allFolders
            .filter(f => !f.is_locked && !f.is_deleted)
            .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
        } else if (filter === 'category' && activeCategory) {
          filteredFiles = allDocs.filter(f => {
            const isEntityDoc = f.clientId || f.staffId || f.kissanId || f.investorId || f.loanId || f.ownerId;
            return String(f.category_id) === String(activeCategory.id) && !isEntityDoc;
          });
          filteredFolders = allFolders.filter(f => String(f.category_id) === String(activeCategory.id));
        } else if (filter === 'all') {
          filteredFiles = allDocs.filter(f => {
            const isEntityDoc = !!(f.clientId || f.staffId || f.kissanId || f.investorId || f.loanId || f.ownerId);
            const f_folder_id = f.folder_id != null ? String(f.folder_id) : (f.folderId != null ? String(f.folderId) : null);
            // Treat null, undefined, and empty string as root (null)
            const normalizedFileFolderId = (f_folder_id === null || f_folder_id === '' || f_folder_id === 'undefined') ? null : f_folder_id;
            const normalizedParentId = (parentId === null || parentId === '' || parentId === 'undefined') ? null : parentId;
            if (normalizedFileFolderId !== normalizedParentId || f.is_deleted) return false;
            
            // As per user request, database page is for the reports.
            // Pure uploaded files (like Aadhaar) mapping to an entity MUST not be here, they strictly sync with their document pages.
            if (isEntityDoc) return false;
            
            return true;
          });
          filteredFolders = allFolders.filter(f => {
            const f_parent_id = f.parent_id != null ? String(f.parent_id) : null;
            const normalizedFileParentId = (f_parent_id === null || f_parent_id === '' || f_parent_id === 'undefined') ? null : f_parent_id;
            const normalizedParentId = (parentId === null || parentId === '' || parentId === 'undefined') ? null : parentId;
            return normalizedFileParentId === normalizedParentId && !f.is_deleted;
          });
        }
      }

      // Fetch virtual entities for the current folder
      let virtualFiles: any[] = [];
      
      const [clients, staff, kissans, investors, loans, transactions] = await Promise.all([
          dbService.getClients(),
          dbService.getStaff(),
          dbService.getKissans(),
          dbService.getInvestors(),
          dbService.getLoans(),
          dbService.getTransactions()
        ]);

        const mapEntity = (e: any, type: string) => {
          let total = 0;
          let paid = 0;
          let remaining = 0;

          const entityTransactions = transactions.filter(t => 
            t.clientId === e.id || t.staffId === e.id || t.kissanId === e.id || t.investorId === e.id || t.loanId === e.id || (t.ownerId && e.owners?.some((o: any) => o.id === t.ownerId))
          );

          switch (type) {
            case 'CLIENT':
              total = (e.totalContractValue || 0) + (e.openingBalance || 0);
              paid = entityTransactions
                .filter(t => t.type === 'CREDIT')
                .reduce((sum, t) => sum + (t.amount || 0), 0);
              remaining = Math.max(0, total - paid);
              break;
            case 'KISSAN':
              total = (e.totalLandValue || 0) + (e.openingBalance || 0);
              paid = entityTransactions
                .filter(t => t.type === 'DEBIT')
                .reduce((sum, t) => sum + (t.amount || 0), 0);
              remaining = Math.max(0, total - paid);
              break;
            case 'INVESTOR':
              total = e.totalAmount || e.totalInvested || 0;
              paid = e.totalReturns || 0;
              remaining = e.currentBalance || 0;
              break;
            case 'LOAN':
              total = e.principalAmount || 0;
              paid = entityTransactions
                .filter(t => t.type === 'DEBIT')
                .reduce((sum, t) => sum + (t.amount || 0), 0);
              remaining = e.remainingPrincipal || 0;
              break;
            case 'STAFF':
              total = e.salary || 0;
              paid = entityTransactions
                .filter(t => t.type === 'DEBIT')
                .reduce((sum, t) => sum + (t.amount || 0), 0);
              remaining = Math.max(0, total - paid);
              break;
          }

          return {
            id: e.id,
            name: e.id, // File name is the ID
            type: 'virtual' as const,
            entityType: type,
            size: 0,
            folder_id: e.folderId,
            created_at: (e as any).createdAt || (e as any).created_at || new Date().toISOString(),
            is_starred: 0,
            is_deleted: 0,
            synced: true,
            date: new Date().toISOString(),
            financialData: {
              total,
              paid,
              remaining,
              isFullyPaid: (remaining <= 0 && total > 0) || (e.status === 'Fully Paid' || e.status === 'Closed')
            }
          };
        };

        const checkMatch = (entityFolderId: any, pId: any) => {
            const e_f_id = entityFolderId != null ? String(entityFolderId) : null;
            const normE = (e_f_id === null || e_f_id === '' || e_f_id === 'undefined') ? null : e_f_id;
            const normP = (pId === null || pId === '' || pId === 'undefined') ? null : pId;
            return normE === normP;
        };

        const checkCategoryMatch = (entityCategoryId: any) => {
            if (filter !== 'category' || !activeCategory) return false;
            return String(entityCategoryId) === String(activeCategory.id);
        };

        const isVirtualFileVisible = (entity: any) => {
           if (filter === 'recent') return true;
           if (filter === 'category') return checkCategoryMatch(entity.categoryId);
           return checkMatch(entity.folderId || entity.folder_id, parentId);
        };

        const folderClients = clients.filter(c => isVirtualFileVisible(c)).map(e => mapEntity(e, 'CLIENT'));
        const folderStaff = staff.filter(st => isVirtualFileVisible(st)).map(e => mapEntity(e, 'STAFF'));
        const folderKissans = kissans.filter(k => isVirtualFileVisible(k)).map(e => mapEntity(e, 'KISSAN'));
        const folderInvestors = investors.filter(i => isVirtualFileVisible(i)).map(e => mapEntity(e, 'INVESTOR'));
        const folderLoans = loans.filter(l => isVirtualFileVisible(l)).map(e => mapEntity(e, 'LOAN'));

        // Filter out those that already have a real history doc in this folder to avoid duplicates
        const existingDocNames = new Set(filteredFiles.map(f => f.name));
        virtualFiles = [...folderClients, ...folderStaff, ...folderKissans, ...folderInvestors, ...folderLoans]
          .filter(v => !existingDocNames.has(v.name));

        if (filter === 'recent') {
          // Sort virtual files by creation date since recent filter needs to be sorted
          virtualFiles.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
        }

      console.log("DEBUG: Filtered folders:", filteredFolders);
      
      // Show virtual reports in All view, Recent view, and Category view
      const finalFiles = ((filter === 'all' || filter === 'recent' || filter === 'category') && !search) 
        ? [...filteredFiles, ...virtualFiles] 
        : filteredFiles;

      // In recent view, combine and sort all files again to interleave virtual and real files properly
      let sortedFinalFiles = finalFiles as any[];
      if (filter === 'recent') {
          sortedFinalFiles = [...sortedFinalFiles].sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
      }
      setFiles(sortedFinalFiles);
      setFolders(filteredFolders);
    } catch (err) {
      console.error("DEBUG: Error in fetchData:", err);
      setFiles([]);
      setFolders([]);
    }

    fetchStorage();
    fetchAllFiles();
  };

  const fetchStorage = async () => {
    try {
      const size = await dbService.getStorage();
      setTotalStorage(size);
    } catch (err) {
      console.error('Storage fetch error:', err);
    }
  };

  const fetchDeletedCategories = async () => {
  try {
    const data = await dbService.getDeletedCategories();
    setDeletedCategories(data || []);
  } catch (err) {
    console.error('Deleted categories fetch error:', err);
  }
};

  const fetchCategories = async () => {
    try {
      const categories = await dbService.getCategories();
      setCategories(categories);
    } catch (err) {
      console.error('Categories fetch error:', err);
    }
  };

  const fetchAllFolders = async () => {
    try {
      const folders = await dbService.getFolders(true);
      setAllFolders(folders);
    } catch (err) {
      console.error('Folders fetch error:', err);
    }
  };

  const fetchAllFiles = async () => {
    try {
      const files = (await dbService.getDocs(true)) as unknown as DocumentFile[];
      setAllFiles(files);
    } catch (err) {
      console.error('Files fetch error:', err);
    }
  };

  useEffect(() => {
    fetchData();
    const unsubscribe = dbService.subscribe(() => {
      fetchData();
      fetchCategories();
      fetchStorage();
    });
    return () => unsubscribe();
  }, [currentFolder, filter, search, activeCategory]);

  useEffect(() => {
    fetchCategories();
    fetchDeletedCategories();
    fetchAllFolders();
    fetchAllFiles();
    fetchStorage();
    addLockedFolders();
  }, []);

  const addLockedFolders = async () => {
    try {
      const response = await dbService.getFolders();
      const existingFolders = Array.isArray(response) ? response : [];
      
      let addedCount = 0;
      const now = new Date().toISOString();
      
      for (let i = 701; i <= 850; i++) {
        const folderName = i.toString().padStart(4, '0');
        if (!existingFolders.find(f => f.name === folderName)) {
          const folderId = folderName;
          await dbService.saveFolder({
            id: folderId,
            name: folderName,
            parent_id: null,
            category_id: null,
            icon: 'Lock',
            is_starred: 0,
            is_deleted: 0,
            is_locked: 1,
            created_at: now,
            updated_at: now
          });
          addedCount++;
        }
      }
      
      if (addedCount > 0) {
        await fetchData();
        await fetchAllFolders();
      }
    } catch (err) {
      console.error('Error adding locked folders:', err);
    }
  };

  const navigateToFolder = (folder: Folder | null) => {
    setFilter('all');
    setActiveCategory(null);
    if (folder === null) {
      setPath([]);
      setCurrentFolder(null);
    } else {
      const existingIndex = path.findIndex(p => p.id === folder.id);
      if (existingIndex !== -1) {
        setPath(path.slice(0, existingIndex + 1));
      } else {
        setPath([...path, folder]);
      }
      setCurrentFolder(folder);
    }
    setSearch('');
    setSelectedItems([]);
  };

  const createFolder = async (name: string, categoryId: string | number | null, parentId: string | number | null = null, icon: string = 'Folder') => {
    setIsCreating(true);
    try {
      await dbService.saveFolder({
        id: Date.now().toString(),
        name,
        parent_id: parentId !== null ? parentId : (currentFolder?.id || null),
        category_id: categoryId,
        icon,
        is_starred: 0,
        is_deleted: 0,
        is_locked: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      fetchData();
      fetchAllFolders();
      setIsFolderModalOpen(false);
      setFolderForm({ name: '', category_id: '' });
    } catch (err: any) {
      console.error('Error creating folder:', err);
      alert(`Failed to create folder: ${err.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  const createCategory = async (name: string, color: string) => {
  const cat = await dbService.addCategory(name, color, 'Folder');

  const updated = await dbService.getCategories();
  setCategories(updated);

  setIsCategoryDropdownOpen(false);
  setTimeout(() => setIsCategoryDropdownOpen(true), 0);

  return cat;
};

  const uploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = e.target.files;
    setSelectedFilesForUpload(files);
    setCompressedFiles(Array.from(files) as File[]);
    setUploadFolderId(currentFolder?.id || null);
    setUploadCategoryId(activeCategory?.id || null);
    setIsUploadModalOpen(true);
  };

  const handleFinalUpload = async () => {
    if (compressedFiles.length === 0) return;
    
    setIsCreating(true);
    console.log("UPLOAD: Starting upload for", compressedFiles.length, "files");
    try {
      let uploadIdx = 0;
      for (const file of compressedFiles) {
        uploadIdx++;
        console.log(`UPLOAD: Processing file ${uploadIdx}/${compressedFiles.length}:`, file.name);
        
        const base64 = await fileToBase64(file);
        
        const docId = `${Date.now()}_${uploadIdx}`;
        console.log(`UPLOAD: Generated ID: ${docId} for folder: ${currentFolder?.id}`);

        await dbService.saveDocument({
          id: docId,
          name: file.name,
          date: new Date().toISOString(),
          size: String(file.size || 0),
          type: file.type.includes('pdf') ? 'pdf' : (file.type.startsWith('image/') ? 'img' : 'file'),
          synced: false,
          category: 'GENERAL',
          fileData: base64,
          folder_id: uploadFolderId ? String(uploadFolderId) : String(currentFolder?.id ?? ''),
          category_id: uploadCategoryId ? Number(uploadCategoryId) : undefined,
          is_starred: 0,
          is_deleted: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
      console.log("UPLOAD: All files saved. Refreshing UI...");
      fetchData();
      setIsUploadModalOpen(false);
      setSelectedFilesForUpload(null);
      setCompressedFiles([]);
      setUploadCategoryId(null);
      setUploadFolderId(null);
      setToast({ type: 'success', message: `Successfully uploaded ${compressedFiles.length} files` });
    } catch (err) {
      console.error('UPLOAD: Critical Failure:', err);
      setToast({ type: 'error', message: 'Failed to upload files' });
    } finally {
      setIsCreating(false);
    }
  };

  const compressFiles = async () => {
    if (!selectedFilesForUpload) return;
    
    const imageFiles = Array.from(selectedFilesForUpload as FileList).filter(f => f.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      setToast({ type: 'error', message: 'No images found to compress. PDF and Docs are skipped.' });
      return;
    }

    setIsCompressing(true);
    console.log("COMPRESS: Starting compression for", imageFiles.length, "images");
    
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      initialQuality: 0.9, // High quality as requested
    };

    try {
      const files = Array.from(selectedFilesForUpload as FileList);
      const compressed = await Promise.all(
        files.map(async (file: File) => {
          if (file.type.startsWith('image/')) {
            console.log("COMPRESS: Compressing image:", file.name);
            try {
              const compressedFile = await imageCompression(file, options);
              console.log(`COMPRESS: ${file.name} compressed from ${file.size} to ${compressedFile.size}`);
              // Ensure we keep the original name
              return new File([compressedFile], file.name, { type: file.type });
            } catch (error) {
              console.error('COMPRESS: Failed for', file.name, error);
              return file;
            }
          }
          console.log("COMPRESS: Skipping non-image file:", file.name);
          return file; // Non-images are not compressed
        })
      );
      setCompressedFiles(compressed);
      setToast({ type: 'success', message: 'Images compressed successfully' });
    } catch (err) {
      console.error('COMPRESS: Error:', err);
      setToast({ type: 'error', message: 'Compression failed' });
    } finally {
      setIsCompressing(false);
    }
  };

  const totalSize = compressedFiles.reduce((acc, file) => acc + (file as any).size, 0);
  const originalSize = selectedFilesForUpload ? Array.from(selectedFilesForUpload as FileList).reduce((acc, file) => acc + file.size, 0) : 0;
  const compressionRatio = originalSize > 0 ? ((originalSize - totalSize) / originalSize * 100).toFixed(1) : 0;

  const deleteItem = async (id: string | number, type: 'file' | 'folder', permanent = false) => {
    if (type === 'folder') {
      const folder = allFolders.find(f => f.id?.toString() === id?.toString());
      if (folder?.is_locked) {
        setConfirmModal({
          isOpen: true,
          title: 'Folder Locked',
          message: 'This folder is locked and cannot be deleted.',
          onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false }))
        });
        return;
      }
    }
    
    setConfirmModal({
      isOpen: true,
      title: permanent ? 'Permanent Deletion' : 'Move to Trash',
      message: permanent 
        ? `Are you sure you want to PERMANENTLY delete this ${type}? This action cannot be undone.`
        : `Are you sure you want to move this ${type} to the trash? It will be automatically deleted permanently after 30 days.`,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        try {
          if (type === 'file') {
            await dbService.deleteDocument(id?.toString() || '', permanent);
          } else {
            await dbService.deleteFolder(id?.toString() || '', permanent);
          }
          await fetchData();
        setToast({ message: `${type} ${permanent ? 'permanently deleted' : 'moved to trash'}`, type: 'success' });
      } catch (err) {
        console.error(`Error deleting ${type}:`, err);
        setToast({ message: `Failed to delete ${type}`, type: 'error' });
      }
    }
  });
};

  const restoreItem = async (id: string | number, type: 'file' | 'folder' | 'category') => {
    try {
      if (type === 'category') {
        await dbService.restoreCategory(id);
        await fetchDeletedCategories();
        await fetchCategories();
      } else if (type === 'folder') {
        await dbService.restoreFolder(id);
      } else {
        await dbService.restoreDoc(id);
      }
      await fetchData();
      setToast({ message: 'Item restored successfully', type: 'success' });
    } catch (err) {
      console.error('Error restoring item:', err);
      setToast({ message: 'Failed to restore item', type: 'error' });
    }
  };

  const emptyTrash = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Empty Trash',
      message: 'Are you sure you want to delete all items in the trash PERMANENTLY? This action cannot be undone.',
      onConfirm: async () => {
        await dbService.emptyTrash();
        await fetchData();
        await fetchDeletedCategories();
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const updateItem = async (id: number | string, type: 'file' | 'folder', data: any) => {
    try {
      console.log(`DEBUG: Updating ${type} ${id} with:`, data);
      if (type === 'file') {
        await dbService.updateDoc(id, data);
      } else {
        await dbService.updateFolder(id, data);
      }
      console.log(`DEBUG: ${type} ${id} updated successfully, fetching new data...`);
      await fetchData();
    } catch (err) {
      console.error('Error updating item:', err);
      setToast({ message: 'Failed to update item', type: 'error' });
    }
  };

  const toggleSelect = (id: number, type: 'file' | 'folder', multi = false) => {
    if (multi) {
      const exists = selectedItems.find(i => i.id === id && i.type === type);
      if (exists) {
        setSelectedItems(selectedItems.filter(i => !(i.id === id && i.type === type)));
      } else {
        setSelectedItems([...selectedItems, { id, type }]);
      }
    } else {
      setSelectedItems([{ id, type }]);
    }
  };

  const openDocument = async (file: DocumentFile) => {
    if (!file.fileData) {
      setToast({ type: 'error', message: 'File content is empty or not available.' });
      return;
    }
    
    try {
      console.log("OPEN: Checking window.api:", !!window.api);
      if (window.api?.openDocument) {
        console.log("OPEN: Opening via Electron:", file.name, "Type:", file.type);
        const result = await window.api.openDocument(file.name, file.fileData, file.type);
        if (!result.success) {
          setToast({ type: 'error', message: `Could not open file: ${result.error}` });
        }
      } else {
        console.warn("OPEN: window.api.openDocument not found. Falling back to browser blob.");
        const blob = base64ToBlob(file.fileData, file.type);
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('Error opening document:', error);
      setToast({ type: 'error', message: 'An unexpected error occurred while opening the file.' });
    }
  };

  // Helper for web fallback
  const base64ToBlob = (base64: string, mimeType: string) => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  };

  const downloadItem = async (item: any, type: 'file' | 'folder') => {
    try {
      if (type === 'file') {
        const response = await fetch(`/api/files/${item.id}/content`);
        if (!response.ok) throw new Error(`Failed to fetch file: ${response.statusText}`);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = item.name;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        // Download folder as zip
        const response = await fetch(`/api/folders/${item.id}/contents`);
        if (!response.ok) throw new Error(`Failed to fetch folder contents: ${response.statusText}`);
        const data = await response.json();
        const files = data.files || [];
        
        if (files.length === 0) {
          setToast({ message: 'Folder is empty. Nothing to download.', type: 'error' });
          return;
        }

        let JSZipLib;

try {
  JSZipLib = (await import('jszip')).default;
} catch (err) {
  console.error('JSZip failed to load', err);
  setToast({ message: 'Compression module failed to load', type: 'error' });
  return;
}

const zip = new JSZipLib();
        await Promise.all(files.map(async (file: any) => {
          const fileRes = await fetch(`/api/files/${file.id}/content`);
          if (!fileRes.ok) throw new Error(`Failed to fetch file ${file.name}: ${fileRes.statusText}`);
          const blob = await fileRes.blob();
          zip.file(file.path, blob);
        }));
        
        const content = await zip.generateAsync({ type: 'blob' });
        const url = window.URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${item.name}.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err: any) {
      console.error('Error downloading:', err);
      setToast({ message: `Failed to download: ${err.message}`, type: 'error' });
    }
  };

  const shareItem = async (item: any, type: 'file' | 'folder') => {
    setToast({ message: `Preparing ${type} for sharing...`, type: 'success' });
    try {
      let fileToShare: File;
      if (type === 'file') {
        const response = await fetch(`/api/files/${item.id}/content`);
        if (!response.ok) throw new Error(`Failed to fetch file: ${response.statusText}`);
        const blob = await response.blob();
        fileToShare = new File([blob], item.name, { type: blob.type || 'application/octet-stream' });
      } else {
        const response = await fetch(`/api/folders/${item.id}/contents`);
        if (!response.ok) throw new Error(`Failed to fetch folder contents: ${response.statusText}`);
        const data = await response.json();
        const files = data.files || [];
        
        if (files.length === 0) {
          setToast({ message: 'Folder is empty. Nothing to share.', type: 'error' });
          return;
        }

        const zip = new JSZip();
        // Fetch files in parallel for better performance
        await Promise.all(files.map(async (file: any) => {
          const fileRes = await fetch(`/api/files/${file.id}/content`);
          if (!fileRes.ok) throw new Error(`Failed to fetch file ${file.name}: ${fileRes.statusText}`);
          const blob = await fileRes.blob();
          zip.file(file.path, blob);
        }));
        
        const content = await zip.generateAsync({ type: 'blob' });
        fileToShare = new File([content], `${item.name}.zip`, { type: 'application/zip' });
      }

      if (navigator.canShare && navigator.canShare({ files: [fileToShare] })) {
        await navigator.share({
          files: [fileToShare],
          title: item.name,
          text: `Sharing ${type}: ${item.name}`
        });
      } else {
        // Fallback to download if sharing files is not supported
        const url = window.URL.createObjectURL(fileToShare);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileToShare.name;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setToast({ message: 'Sharing files not supported. Item downloaded instead.', type: 'error' });
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      console.error('Error sharing:', err);
      setToast({ message: `Failed to share item: ${err.message}`, type: 'error' });
    }
  };

  const mailItem = async (item: any, type: 'file' | 'folder') => {
    setToast({ message: 'Preparing email...', type: 'success' });
    
    try {
      let fileToShare: File;
      if (type === 'file') {
        const response = await fetch(`/api/files/${item.id}/content`);
        if (!response.ok) throw new Error(`Failed to fetch file: ${response.statusText}`);
        const blob = await response.blob();
        fileToShare = new File([blob], item.name, { type: blob.type || 'application/octet-stream' });
      } else {
        const response = await fetch(`/api/folders/${item.id}/contents`);
        if (!response.ok) throw new Error(`Failed to fetch folder contents: ${response.statusText}`);
        const data = await response.json();
        const files = data.files || [];

        if (files.length === 0) {
          setToast({ message: 'Folder is empty. Nothing to mail.', type: 'error' });
          return;
        }

        const zip = new JSZip();
        // Fetch files in parallel
        await Promise.all(files.map(async (file: any) => {
          const fileRes = await fetch(`/api/files/${file.id}/content`);
          if (!fileRes.ok) throw new Error(`Failed to fetch file ${file.name}: ${fileRes.statusText}`);
          const blob = await fileRes.blob();
          zip.file(file.path, blob);
        }));
        
        const content = await zip.generateAsync({ type: 'blob' });
        fileToShare = new File([content], `${item.name}.zip`, { type: 'application/zip' });
      }

      if (navigator.canShare && navigator.canShare({ files: [fileToShare] })) {
        await navigator.share({
          files: [fileToShare],
          title: `Shared ${type}: ${item.name}`,
          text: `Hi,\n\nI've shared a ${type} with you: ${item.name}`
        });
      } else {
        // Fallback to mailto with link and download
        const subject = encodeURIComponent(`Shared ${type}: ${item.name}`);
        const body = encodeURIComponent(`Hi,\n\nI've shared a ${type} with you: ${item.name}\n\nI've also attached the file to this email (please check your downloads if it didn't attach automatically).`);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
        
        // Also trigger download so they can attach it manually
        const url = window.URL.createObjectURL(fileToShare);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileToShare.name;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        setToast({ message: 'Email client opened. Item downloaded for manual attachment.', type: 'success' });
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      console.error('Error mailing:', err);
      setToast({ message: `Failed to prepare email: ${err.message}`, type: 'error' });
    }
  };

  const copyItem = (id: number, type: 'file' | 'folder', action: 'copy' | 'cut') => {
    setClipboard({ id, type, action });
  };

  const pasteItem = (targetFolderId: number | null) => {
    if (!clipboard) return;
    
    if (clipboard.action === 'copy') {
      fetch(`/api/${clipboard.type === 'file' ? 'files' : 'folders'}/${clipboard.id}/duplicate`, {
        method: 'POST'
      }).then(res => res.json())
        .then(data => {
          if (data.id) {
            const updateData = clipboard.type === 'folder' 
              ? { parent_id: targetFolderId } 
              : { folder_id: targetFolderId };
            updateItem(data.id, clipboard.type, updateData);
          }
        });
    } else {
      const updateData = clipboard.type === 'folder' 
        ? { parent_id: targetFolderId } 
        : { folder_id: targetFolderId };
      updateItem(clipboard.id, clipboard.type, updateData);
    }
    setClipboard(null);
  };

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const handleContextMenu = (e: React.MouseEvent, item: any, type: 'file' | 'folder' | 'category' | 'empty') => {
    e.preventDefault();
    e.stopPropagation();
    
    // Estimate menu dimensions
    const menuWidth = 192; // w-48 is 192px
    let menuHeight = 200; // Default estimate
    
    if (type === 'folder') menuHeight = 400;
    else if (type === 'file') menuHeight = 280;
    else if (type === 'empty') menuHeight = 120;
    else if (type === 'category') menuHeight = 100;

    let x = e.clientX;
    let y = e.clientY;

    // Adjust horizontal position if it goes off-screen
    if (x + menuWidth > window.innerWidth) {
      x = x - menuWidth;
    }

    // Adjust vertical position if it goes off-screen
    if (y + menuHeight > window.innerHeight) {
      y = y - menuHeight;
    }

    // Ensure it doesn't go off the top or left edges
    x = Math.max(10, x);
    y = Math.max(10, y);

    setContextMenu({ x, y, item, type });
  };

  const sortItems = (items: any[]) => {
    return [...items].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const sortedFiles = sortItems(files);
  const sortedFolders = sortItems(folders);

  // Helper to calculate folder size recursively
  const getFolderSize = (folderId: number): number => {
    let total = 0;
    // Files in this folder
    const filesInFolder = allFiles.filter(f => f.folder_id === folderId);
    total += filesInFolder.reduce((acc, f) => acc + (f.size || 0), 0);
    
    // Subfolders
    const subfolders = allFolders.filter(f => f.parent_id === folderId);
    subfolders.forEach(sf => {
      total += getFolderSize(sf.id);
    });
    
    return total;
  };

  const lastSelectedItem = selectedItems.length > 0 ? 
    (selectedItems[selectedItems.length - 1].type === 'file' ? 
      files.find(f => f.id === selectedItems[selectedItems.length - 1].id) : 
      folders.find(f => f.id === selectedItems[selectedItems.length - 1].id)) : null;

  const openProperties = (selectedItemOverride?: { item: any, type: 'file' | 'folder' }) => {
    if (selectedItemOverride) {
      setItemForProperties(selectedItemOverride);
      setIsPropertiesModalOpen(true);
    } else if (lastSelectedItem) {
      setItemForProperties({ 
        item: lastSelectedItem, 
        type: selectedItems[selectedItems.length - 1].type 
      });
      setIsPropertiesModalOpen(true);
    } else if (currentFolder) {
      setItemForProperties({ 
        item: currentFolder, 
        type: 'folder' 
      });
      setIsPropertiesModalOpen(true);
    } else {
      setToast({ message: 'Please select an item first to view properties', type: 'error' });
    }
  };

  return (
    <div className="flex flex-col w-full h-full" onClick={() => { setContextMenu(null); setIsCategoryDropdownOpen(false); }}>
      {/* Main Content */}
      <main className="flex-1 flex flex-col relative">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 flex flex-col shrink-0">
          {/* Row 1: Search and Actions */}
          <div className="h-16 flex items-center gap-6 px-8 border-b border-gray-50">
            <div className="flex-1 max-w-2xl relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search files..." 
                className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-lg focus:ring-2 focus:ring-orange-500 text-sm transition-all"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-3 ml-auto">
              {clipboard && (
                <button 
                  onClick={() => pasteItem(currentFolder?.id || null)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-medium hover:bg-green-100 transition-all"
                >
                  <ClipboardPaste className="w-4 h-4" />
                  Paste Here
                </button>
              )}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
                >
                  <ListIcon className="w-4 h-4" />
                </button>
              </div>
              <button 
                onClick={() => { 
                  setEditingFolder(null); 
                  setFolderForm({ 
                    name: '', 
                    category_id: activeCategory?.id || '',
                    parent_id: currentFolder?.id || null
                  });
                  setIsFolderModalOpen(true); 
                }}
                className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Folder
              </button>
              <label className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors">
                <Upload className="w-4 h-4" />
                Upload
                <input type="file" className="hidden" onChange={uploadFile} multiple />
              </label>
              <button 
                onClick={() => openProperties()}
                title="View Properties"
                className={`p-2 rounded-lg transition-colors bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-orange-600`}
              >
                <Info className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Row 2: Navigation (Sidebar Items) and Storage */}
          <div className="h-14 flex items-center gap-6 px-8">
            <nav className="flex items-center gap-1">
              <button 
                onClick={() => { setFilter('all'); navigateToFolder(null); }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all' ? 'bg-orange-50 text-orange-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <FolderIcon className="w-4 h-4" />
                All Files
              </button>
              <button 
                onClick={() => setFilter('recent')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'recent' ? 'bg-orange-50 text-orange-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Clock className="w-4 h-4" />
                Recent
              </button>
              <button 
                onClick={() => setFilter('starred')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'starred' ? 'bg-orange-50 text-orange-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Star className="w-4 h-4" />
                Starred
              </button>
              <button 
                onClick={() => setFilter('trash')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'trash' ? 'bg-orange-50 text-orange-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Trash2 className="w-4 h-4" />
                Trash
              </button>

              <div className="relative">
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsCategoryDropdownOpen(!isCategoryDropdownOpen); }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'category' ? 'bg-orange-50 text-orange-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <Tag className="w-4 h-4" />
                  <span>Categories</span>
                  <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                 {isCategoryDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col">
                    <div className="px-4 py-4 flex items-center justify-between bg-gray-50/80 backdrop-blur-md border-b border-gray-100">
                      <div>
                        <h3 className="text-sm font-bold text-gray-900 tracking-tight">Categories</h3>
                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest mt-0.5">Filter by tag</p>
                      </div>
                      <button 
                        onClick={() => { setEditingCategory(null); setIsCategoryModalOpen(true); setIsCategoryDropdownOpen(false); }} 
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 text-white rounded-lg text-[11px] font-bold hover:bg-orange-700 transition-all shadow-sm hover:shadow-md active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>

                    <div className="p-3 border-b border-gray-50">
                      <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                        <input 
                          type="text" 
                          placeholder="Search categories..."
                          className="w-full pl-9 pr-4 py-2 bg-gray-100 border-transparent focus:bg-white focus:border-orange-200 border rounded-xl outline-none transition-all text-xs"
                          value={categorySearch}
                          onChange={(e) => setCategorySearch(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>

                    <div className="max-h-80 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                      {categories.filter(c => c.name.toLowerCase().includes(categorySearch.toLowerCase())).length === 0 ? (
                        <div className="py-10 px-4 text-center">
                          <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Tag className="w-6 h-6 text-gray-200" />
                          </div>
                          <p className="text-xs font-medium text-gray-400">No categories found</p>
                        </div>
                      ) : (
                        categories
                          .filter(c => c.name.toLowerCase().includes(categorySearch.toLowerCase()))
                          .slice(0, 5)
                          .map(cat => (
                            <button 
                              key={cat.id}
                              onClick={() => { setFilter('category'); setActiveCategory(cat); setCurrentFolder(null); setPath([]); setIsCategoryDropdownOpen(false); }}
                              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${filter === 'category' && activeCategory?.id === cat.id ? 'bg-orange-50 text-orange-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${filter === 'category' && activeCategory?.id === cat.id ? 'bg-white shadow-md scale-105' : 'bg-gray-50 group-hover:bg-white group-hover:shadow-sm'}`}>
                                  <DynamicIcon name={cat.icon} className="w-4.5 h-4.5" style={{ color: cat.color }} />
                                </div>
                                <div className="text-left">
                                  <p className="text-sm font-semibold truncate max-w-[140px]">{cat.name}</p>
                                  <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">View files</p>
                                </div>
                              </div>
                              {filter === 'category' && activeCategory?.id === cat.id ? (
                                <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                              )}
                            </button>
                          ))
                      )}
                    </div>
                    
                    <div className="p-3 border-t border-gray-100 bg-gray-50/50 flex gap-2">
                      <button 
                        onClick={() => { 
                          if (onManageCategories) {
                            onManageCategories();
                          } else {
                            setItemsToCategorize([]); 
                            setIsAssignCategoryModalOpen(true); 
                          }
                          setIsCategoryDropdownOpen(false); 
                        }}
                        className="flex-1 py-2.5 bg-white border border-gray-200 rounded-xl text-[11px] font-bold text-gray-500 hover:text-orange-600 hover:border-orange-200 hover:shadow-sm transition-all flex items-center justify-center gap-2"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        Manage
                      </button>
                      <button 
                        onClick={async () => {
  await createCategory('New Category', '#F97316');
  setIsCategoryModalOpen(false);
}}
                        className="flex-1 py-2.5 bg-white border border-gray-200 rounded-xl text-[11px] font-bold text-gray-500 hover:text-orange-600 hover:border-orange-200 hover:shadow-sm transition-all flex items-center justify-center gap-2"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Create
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </nav>

            <div className="hidden xl:flex items-center gap-3 ml-auto px-4 py-1.5 bg-gray-50 rounded-full border border-gray-100">
              <HardDrive className="w-3 h-3 text-orange-500" />
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Storage: {formatSize(totalStorage)}</span>
            </div>
          </div>
        </header>

        {/* Breadcrumbs / Selection Info */}
        <div className="px-8 py-3 flex items-center justify-between text-sm border-b border-gray-200 bg-white shrink-0">
          <div className="flex items-center gap-2 text-gray-500">
            {selectedItems.length > 0 ? (
              <div className="flex items-center gap-4">
                <span className="font-semibold text-orange-600">{selectedItems.length} selected</span>
                <div className="h-4 w-px bg-gray-200"></div>
                <button onClick={() => setSelectedItems([])} className="hover:text-gray-900">Clear</button>
                <div className="h-4 w-px bg-gray-200"></div>
                
                {selectedItems.length === 1 && selectedItems[0].type === 'file' && (
                  <button className="flex items-center gap-1 hover:text-orange-600" onClick={() => {
                    const file = files.find(f => f.id === selectedItems[0].id);
                    if (file) openDocument(file);
                  }}>
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                )}

                {selectedItems.length === 1 && (
                  <button className="flex items-center gap-1 hover:text-orange-600" onClick={() => {
                    const item = selectedItems[0];
                    if (item.type === 'folder') {
                      const folder = folders.find(f => f.id === item.id);

if (!folder) {
  console.error("❌ Folder not found for delete:", item.id);
  return;
}
                      if (folder) {
                        setEditingFolder(folder);
                        setFolderForm({ name: folder.name, category_id: folder.category_id || '', parent_id: folder.parent_id });
                        setIsFolderModalOpen(true);
                      }
                    } else {
                      const file = files.find(f => f.id === item.id);
                      if (file) {
                        setEditingFile(file);
                        setIsFileModalOpen(true);
                      }
                    }
                  }}>
                    <Edit2 className="w-4 h-4" />
                    Rename
                  </button>
                )}

                <button className="flex items-center gap-1 hover:text-orange-600" onClick={() => {
                  const item = selectedItems[0];
                  copyItem(item.id, item.type, 'copy');
                  setSelectedItems([]);
                }}>
                  <Copy className="w-4 h-4" />
                  Copy
                </button>

                <button className="flex items-center gap-1 hover:text-orange-600" onClick={() => {
                  const item = selectedItems[0];
                  copyItem(item.id, item.type, 'cut');
                  setSelectedItems([]);
                }}>
                  <Scissors className="w-4 h-4" />
                  Cut
                </button>

                {selectedItems.every(i => i.type === 'folder') && (
                  <button 
                    className="flex items-center gap-1 hover:text-orange-600"
                    onClick={() => {
                      setItemsToCategorize(selectedItems);
                      setIsAssignCategoryModalOpen(true);
                    }}
                  >
                    <Tag className="w-4 h-4" />
                    {selectedItems.some(i => i.type === 'folder' && folders.find(f => f.id === i.id)?.category_id) 
                      ? 'Manage Category' 
                      : 'Assign Category'}
                  </button>
                )}

                {!(selectedItems.some(i => i.type === 'folder' && folders.find(f => f.id === i.id)?.is_locked)) && (
                  <button className="flex items-center gap-1 hover:text-red-600" onClick={() => {
                    selectedItems.forEach(i => deleteItem(i.id, i.type, filter === 'trash'));
                    setSelectedItems([]);
                  }}>
                    <Trash2 className="w-4 h-4" />
                    {filter === 'trash' ? 'Delete Permanently' : 'Move to Trash'}
                  </button>
                )}
                <button className="flex items-center gap-1 hover:text-green-600" onClick={() => {
                  selectedItems.forEach(i => restoreItem(i.id, i.type as 'file' | 'folder'));
                  setSelectedItems([]);
                }}>
                  <RefreshCw className="w-4 h-4" />
                  Restore
                </button>
              </div>
            ) : (
              <>
                <button 
                  onClick={() => navigateToFolder(null)}
                  className="hover:text-orange-600 transition-colors"
                >
                  Root
                </button>
                {path.map((folder, i) => (
                  <React.Fragment key={folder.id}>
                    <ChevronRight className="w-4 h-4" />
                    <button 
                      onClick={() => navigateToFolder(folder)}
                      className={`hover:text-orange-600 transition-colors ${i === path.length - 1 ? 'font-semibold text-gray-900' : ''}`}
                    >
                      {folder.name}
                    </button>
                  </React.Fragment>
                ))}
              </>
            )}
          </div>
          <div className="flex items-center gap-4">
            {filter === 'trash' && (
              <button 
                onClick={emptyTrash}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Empty Trash
              </button>
            )}
            <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">
              {folders.length} folders, {files.length} files (Total: {allFolders.length})
            </span>
          </div>
        </div>

        {/* File Grid/List */}
        <div 
          className="flex-1 overflow-y-auto p-8 bg-white/50"
          onContextMenu={(e) => handleContextMenu(e, null, 'empty')}
        >
          {filter === 'trash' && (
            <div className="mb-8 p-4 bg-orange-50 border border-orange-100 rounded-xl flex items-center gap-4 text-orange-800">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                <Info className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Trash Bin Policy</h4>
                <p className="text-xs opacity-80">Items in the trash will be automatically deleted permanently after 30 days.</p>
              </div>
            </div>
          )}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
              {/* Trash Items (Combined View) */}
              {filter === 'trash' && (
                <>
                  {deletedCategories.map(cat => (
                    <div key={`trash-cat-${cat.id}`} className="group relative flex flex-col items-center p-4 rounded-xl border bg-red-50/50 border-red-100 hover:border-red-200 hover:shadow-sm transition-all">
                      <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center mb-3 shadow-sm">
                        <DynamicIcon name={cat.icon || 'Tag'} className="w-8 h-8 text-red-400" />
                      </div>
                      <span className="text-sm font-medium text-center truncate w-full px-2 text-gray-700">{cat.name}</span>
                      <span className="text-[10px] text-red-500 font-medium uppercase mt-0.5">Category</span>
                      <div className="mt-3 flex gap-1 items-center">
                        <button
                          onClick={() => restoreItem(cat.id, 'category')}
                          className="px-2 py-1 text-[10px] bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors font-bold"
                        >
                          Restore
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Permanently delete this category?')) {
                              dbService.permanentlyDeleteCategory(cat.id).then(() => fetchDeletedCategories());
                            }
                          }}
                          className="px-2 py-1 text-[10px] bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors font-bold"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                  {sortedFolders.map(folder => (
                    <div key={`trash-folder-${folder.id}`} className="group relative flex flex-col items-center p-4 rounded-xl border bg-gray-50/50 border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
                      <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center mb-3 shadow-sm">
                        <FolderIcon className="w-8 h-8 text-gray-400" />
                      </div>
                      <span className="text-sm font-medium text-center truncate w-full px-2 text-gray-700">{folder.name}</span>
                      <span className="text-[10px] text-gray-400 font-medium uppercase mt-0.5">Folder</span>
                      <div className="mt-3 flex gap-1 items-center">
                        <button
                          onClick={() => restoreItem(folder.id, 'folder')}
                          className="px-2 py-1 text-[10px] bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors font-bold"
                        >
                          Restore
                        </button>
                        <button
                          onClick={() => deleteItem(folder.id, 'folder', true)}
                          className="px-2 py-1 text-[10px] bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors font-bold"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                  {sortedFiles.map(file => (
                    <div key={`trash-file-${file.id}`} className="group relative flex flex-col items-center p-4 rounded-xl border bg-gray-50/50 border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
                      <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center mb-3 shadow-sm">
                        <FileIcon className="w-8 h-8 text-gray-400" />
                      </div>
                      <span className="text-sm font-medium text-center truncate w-full px-2 text-gray-700">{file.name}</span>
                      <span className="text-[10px] text-gray-400 font-medium uppercase mt-0.5">File</span>
                      <div className="mt-3 flex gap-1 items-center">
                        <button
                          onClick={() => restoreItem(file.id, 'file')}
                          className="px-2 py-1 text-[10px] bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors font-bold"
                        >
                          Restore
                        </button>
                        <button
                          onClick={() => deleteItem(file.id, 'file', true)}
                          className="px-2 py-1 text-[10px] bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors font-bold"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {/* Normal Grid View Items */}
              {filter !== 'trash' && sortedFolders.map(folder => {
                const isSelected = selectedItems.some(i => i.id === folder.id && i.type === 'folder');
                return (
                  <div 
                    key={folder.id} 
                    role="button"
                    tabIndex={0}
                    className={`group relative flex flex-col items-center p-4 rounded-xl transition-all cursor-pointer border ${isSelected ? 'bg-orange-50 border-orange-200 shadow-sm' : 'hover:bg-white hover:shadow-md border-transparent hover:border-gray-200'}`}
                    onClick={(e) => toggleSelect(folder.id, 'folder', e.metaKey || e.ctrlKey)}
                    onDoubleClick={() => navigateToFolder(folder)}
                    onContextMenu={(e) => handleContextMenu(e, folder, 'folder')}
                  >
                    <div className="w-16 h-16 bg-orange-50 rounded-lg flex items-center justify-center mb-3 group-hover:scale-105 transition-transform relative">
                      <DynamicIcon name={folder.icon || 'Folder'} className={`w-8 h-8 ${folder.is_starred ? 'text-yellow-500 fill-yellow-500/20' : 'text-orange-500 fill-orange-500/20'}`} />
                      {folder.is_starred && (
                        <div className="absolute -top-1 -left-1 bg-white rounded-full p-1 shadow-sm border border-gray-100 animate-pulse">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        </div>
                      )}
                      {folder.is_locked === 1 && (
                        <div className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow-sm border border-gray-100">
                          <Lock className="w-3 h-3 text-red-500" />
                        </div>
                      )}
                    </div>
                    <span className="text-sm font-medium text-center truncate w-full px-2">{folder.name}</span>
                    {folder.category_id && (
                      <div className="mt-1 flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-[10px] font-medium text-gray-600">
                        <DynamicIcon name={categories.find(c => c.id === folder.category_id)?.icon || 'Tag'} className="w-2.5 h-2.5" style={{ color: categories.find(c => c.id === folder.category_id)?.color }} />
                        <span className="truncate max-w-[60px]">{categories.find(c => c.id === folder.category_id)?.name}</span>
                      </div>
                    )}
                    <div className={`absolute top-2 left-2 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                      {isSelected ? <CheckCircle2 className="w-4 h-4 text-orange-600" /> : <Circle className="w-4 h-4 text-gray-300" />}
                    </div>
                    <button 
                      type="button"
                      className="absolute top-2 right-8 opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded-lg transition-all"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        openProperties({ item: folder, type: 'folder' });
                      }}
                      title="View Properties"
                    >
                      <Info className="w-4 h-4 text-gray-400" />
                    </button>
                    <button 
                      type="button"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded-lg transition-all"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleContextMenu(e as any, folder, 'folder');
                      }}
                    >
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                );
              })}
              {filter !== 'trash' && sortedFiles.map(file => {
                const isSelected = selectedItems.some(i => i.id === file.id && i.type === 'file');
                return (
                  <div 
                    key={file.id} 
                    className={`group relative flex flex-col items-center p-4 rounded-xl transition-all cursor-pointer border ${isSelected ? 'bg-orange-50 border-orange-200 shadow-sm' : 'hover:bg-white hover:shadow-md border-transparent hover:border-gray-200'}`}
                    onClick={(e) => toggleSelect(file.id, 'file', e.metaKey || e.ctrlKey)}
                    onDoubleClick={() => {
                        if ((file as any).type === 'virtual') {
                            setIntelligenceId(file.id.toString());
                        } else {
                            openDocument(file);
                        }
                    }}
                    onContextMenu={(e) => handleContextMenu(e, file, 'file')}
                    title={`Name: ${file.name}\nType: ${file.type}`}
                  >
                    <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center mb-3 group-hover:scale-105 transition-transform relative">
                      {(file as any).type === 'virtual' ? (
                          <div className="relative">
                            <FileText className="w-8 h-8 text-brand-600" />
                            <div className="absolute -bottom-1 -right-1 bg-brand-600 rounded-full p-0.5 border-2 border-white">
                                <Search className="w-2.5 h-2.5 text-white" />
                            </div>
                            {(file as any).financialData?.isFullyPaid && (
                                <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5 border-2 border-white">
                                    <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                                </div>
                            )}
                          </div>
                      ) : (
                          <FileIcon className={`w-8 h-8 ${file.is_starred ? 'text-yellow-500' : 'text-gray-400'}`} />
                      )}
                      {file.is_starred && (
                        <div className="absolute -top-1 -left-1 bg-white rounded-full p-1 shadow-sm border border-gray-100 animate-pulse">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        </div>
                      )}
                    </div>
                    <span className={`text-sm font-medium text-center truncate w-full px-2 ${(file as any).type === 'virtual' ? 'text-brand-700' : ''}`}>
                        {file.name}
                    </span>
                    {(file as any).type === 'virtual' && (
                        <div className="flex flex-col items-center mt-1">
                          <span className="text-[8px] font-black uppercase text-brand-400 italic tracking-widest leading-none">Profile Report</span>
                          {(file as any).financialData && (
                            <span className={`text-[10px] font-bold mt-1 ${(file as any).financialData.isFullyPaid ? 'text-green-600' : 'text-red-500'}`}>
                              {(file as any).financialData.isFullyPaid ? 'FULLY PAID' : `Bal: ₹${(file as any).financialData.remaining.toLocaleString()}`}
                            </span>
                          )}
                        </div>
                    )}
                    <div className={`absolute top-2 left-2 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                      {isSelected ? <CheckCircle2 className="w-4 h-4 text-orange-600" /> : <Circle className="w-4 h-4 text-gray-300" />}
                    </div>
                    <button 
                      type="button"
                      className="absolute top-2 right-8 opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded-lg transition-all"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        openProperties({ item: file, type: 'file' });
                      }}
                      title="View Properties"
                    >
                      <Info className="w-4 h-4 text-gray-400" />
                    </button>
                    <button 
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded-lg transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleContextMenu(e as any, file, 'file');
                      }}
                    >
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 font-semibold text-gray-600 cursor-pointer hover:bg-gray-100" onClick={() => setSortConfig({ key: 'name', direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' })}>
                      <div className="flex items-center gap-2">
                        Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                      </div>
                    </th>
                    <th className="px-6 py-3 font-semibold text-gray-600 cursor-pointer hover:bg-gray-100" onClick={() => setSortConfig({ key: 'type', direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' })}>
                      <div className="flex items-center gap-2">
                        Type {sortConfig.key === 'type' && (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                      </div>
                    </th>
                    <th className="px-6 py-3 font-semibold text-gray-600 cursor-pointer hover:bg-gray-100" onClick={() => setSortConfig({ key: 'created_at', direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' })}>
                      <div className="flex items-center gap-2">
                        Date {sortConfig.key === 'created_at' && (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                      </div>
                    </th>
                    <th className="px-6 py-3 font-semibold text-gray-600">Total Paid</th>
                    <th className="px-6 py-3 font-semibold text-gray-600">Remaining</th>
                    <th className="px-6 py-3 font-semibold text-gray-600">Status</th>
                    <th className="px-6 py-3 font-semibold text-gray-600"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {/* Trash items in List view */}
                  {filter === 'trash' && deletedCategories.map(cat => (
                    <tr key={`list-trash-cat-${cat.id}`} className="hover:bg-red-50 bg-red-50/20 transition-colors">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <DynamicIcon name={cat.icon || 'Tag'} className="w-5 h-5 text-red-400" />
                        <span className="font-medium">{cat.name}</span>
                      </td>
                      <td className="px-6 py-4 text-red-500 font-medium italic">Category</td>
                      <td className="px-6 py-4 text-gray-400">-</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => restoreItem(cat.id, 'category')} className="text-green-600 hover:text-green-700 font-bold text-xs bg-green-50 px-2 py-1 rounded">Restore</button>
                          <button onClick={() => { if(window.confirm('Permanent delete?')) dbService.permanentlyDeleteCategory(cat.id).then(() => fetchDeletedCategories()); }} className="text-red-600 hover:text-red-700 font-bold text-xs bg-red-50 px-2 py-1 rounded">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {sortedFolders.map(folder => {
                    const isSelected = selectedItems.some(i => i.id === folder.id && i.type === 'folder');
                    return (
                      <tr 
                        key={folder.id} 
                        className={`hover:bg-orange-50 cursor-pointer transition-colors ${isSelected ? 'bg-orange-50' : ''} ${filter === 'trash' ? 'bg-gray-50/50' : ''}`}
                        onClick={(e) => toggleSelect(folder.id, 'folder', e.metaKey || e.ctrlKey)}
                        onDoubleClick={() => filter !== 'trash' && navigateToFolder(folder)}
                        onContextMenu={(e) => handleContextMenu(e, folder, 'folder')}
                      >
                        <td className="px-6 py-4 flex items-center gap-3">
                          {isSelected ? <CheckCircle2 className="w-4 h-4 text-orange-600" /> : <DynamicIcon name={folder.icon || 'Folder'} className={`w-5 h-5 ${folder.is_starred ? 'text-yellow-500' : (filter === 'trash' ? 'text-gray-400' : 'text-orange-500')}`} />}
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className={`font-medium ${filter === 'trash' ? 'text-gray-600' : ''}`}>{folder.name}</span>
                              {folder.is_starred && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 italic" />}
                              {folder.is_locked === 1 && <Lock className="w-3 h-3 text-red-500" />}
                            </div>
                            {folder.category_id && (
                              <div className="flex items-center gap-1 mt-0.5">
                                <DynamicIcon name={categories.find(c => c.id === folder.category_id)?.icon || 'Tag'} className="w-2.5 h-2.5" style={{ color: categories.find(c => c.id === folder.category_id)?.color }} />
                                <span className="text-[10px] text-gray-500">{categories.find(c => c.id === folder.category_id)?.name}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-500">Folder</td>
                        <td className="px-6 py-4 text-gray-500">{folder.created_at ? new Date(folder.created_at).toLocaleDateString() : '-'}</td>
                        <td className="px-6 py-4 text-gray-500">-</td>
                        <td className="px-6 py-4 text-gray-500">-</td>
                        <td className="px-6 py-4 text-gray-500">-</td>
                        <td className="px-6 py-4 text-right">
                          {filter === 'trash' ? (
                            <div className="flex justify-end gap-2">
                              <button onClick={(e) => { e.stopPropagation(); restoreItem(folder.id, 'folder'); }} className="text-green-600 hover:text-green-700 font-bold text-xs bg-green-50 px-2 py-1 rounded">Restore</button>
                              <button onClick={(e) => { e.stopPropagation(); deleteItem(folder.id, 'folder', true); }} className="text-red-600 hover:text-red-700 font-bold text-xs bg-red-50 px-2 py-1 rounded">Delete</button>
                            </div>
                          ) : (
                            <div className="flex justify-end gap-1">
                              <button 
                                className="p-1 hover:bg-gray-200 rounded-lg transition-all"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openProperties({ item: folder, type: 'folder' });
                                }}
                                title="Properties"
                              >
                                <Info className="w-4 h-4 text-gray-400" />
                              </button>
                              <button 
                                className="p-1 hover:bg-gray-200 rounded-lg transition-all"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleContextMenu(e as any, folder, 'folder');
                                }}
                              >
                                <MoreVertical className="w-4 h-4 text-gray-400" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {sortedFiles.map(file => {
                    const isSelected = selectedItems.some(i => i.id === file.id && i.type === 'file');
                    return (
                      <tr 
                        key={file.id} 
                        className={`hover:bg-orange-50 cursor-pointer transition-colors ${isSelected ? 'bg-orange-50' : ''} ${filter === 'trash' ? 'bg-gray-50/50' : ''}`}
                        onClick={(e) => toggleSelect(file.id, 'file', e.metaKey || e.ctrlKey)}
                        onContextMenu={(e) => handleContextMenu(e, file, 'file')}
                      >
                        <td className="px-6 py-4 flex items-center gap-3">
                          {isSelected ? <CheckCircle2 className="w-4 h-4 text-orange-600" /> : <FileIcon className={`w-5 h-5 ${file.is_starred ? 'text-yellow-500' : 'text-gray-400'}`} />}
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${filter === 'trash' ? 'text-gray-600' : ''}`}>{file.name}</span>
                            {file.is_starred && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-500">{file.type}</td>
                        <td className="px-6 py-4 text-gray-500">{file.created_at ? new Date(file.created_at).toLocaleDateString() : '-'}</td>
                        <td className="px-6 py-4 text-gray-500">
                          {(file as any).financialData ? `₹${((file as any).financialData.paid || 0).toLocaleString()}` : '-'}
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          {(file as any).financialData ? (
                            <span className={((file as any).financialData.remaining || 0) > 0 ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}>
                              ₹{((file as any).financialData.remaining || 0).toLocaleString()}
                            </span>
                          ) : '-'}
                        </td>
                        <td className="px-6 py-4">
                          {(file as any).financialData ? (
                            (file as any).financialData.isFullyPaid ? (
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-black uppercase rounded-full tracking-tighter">Fully Paid</span>
                            ) : (
                              <span className="px-2 py-1 bg-orange-100 text-orange-700 text-[10px] font-black uppercase rounded-full tracking-tighter">Pending</span>
                            )
                          ) : '-'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {filter === 'trash' ? (
                            <div className="flex justify-end gap-2">
                              <button onClick={(e) => { e.stopPropagation(); restoreItem(file.id, 'file'); }} className="text-green-600 hover:text-green-700 font-bold text-xs bg-green-50 px-2 py-1 rounded">Restore</button>
                              <button onClick={(e) => { e.stopPropagation(); deleteItem(file.id, 'file', true); }} className="text-red-600 hover:text-red-700 font-bold text-xs bg-red-50 px-2 py-1 rounded">Delete</button>
                            </div>
                          ) : (
                            <div className="flex justify-end gap-1">
                              <button 
                                className="p-1 hover:bg-gray-200 rounded-lg transition-all"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openProperties({ item: file, type: 'file' });
                                }}
                                title="Properties"
                              >
                                <Info className="w-4 h-4 text-gray-400" />
                              </button>
                              <button 
                                className="p-1 hover:bg-gray-200 rounded-lg transition-all"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleContextMenu(e as any, file, 'file');
                                }}
                              >
                                <MoreVertical className="w-4 h-4 text-gray-400" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {folders.length === 0 && files.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <FolderIcon className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg">No items found</p>
              <p className="text-sm">Try changing your filters or uploading a file</p>
            </div>
          )}
        </div>

        {/* Modals */}
        {isFolderModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-lg font-bold">{editingFolder ? 'Edit Folder' : 'New Folder'}</h3>
                <button onClick={() => setIsFolderModalOpen(false)} className="text-gray-400 hover:text-gray-900">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={async (e) => {
                e.preventDefault();
                const name = folderForm.name;
                const categoryId = folderForm.category_id ? parseInt(folderForm.category_id.toString()) : null;
                
                if (editingFolder) {
                  updateItem(editingFolder.id, 'folder', { name, category_id: categoryId, icon: folderForm.icon });
                  setIsFolderModalOpen(false);
                } else {
                  createFolder(name, categoryId, folderForm.parent_id, folderForm.icon);
                }
              }} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Folder Name</label>
                  <input 
                    name="name" 
                    type="text" 
                    required 
                    value={folderForm.name}
                    onChange={e => setFolderForm({ ...folderForm, name: e.target.value })}
                    placeholder="e.g. Invoices 2024"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Category</label>
                  <div className="flex gap-2">
                    <select 
                      name="category_id" 
                      value={folderForm.category_id}
                      onChange={e => setFolderForm({ ...folderForm, category_id: e.target.value })}
                      className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    >
                      <option value="">No Category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                    <button 
                      type="button"
                      onClick={() => { setEditingCategory(null); setIsCategoryModalOpen(true); }}
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors"
                      title="Create New Category"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Folder Icon</label>
                  <div className="grid grid-cols-6 gap-2 max-h-40 overflow-y-auto p-2 bg-gray-50 border border-gray-200 rounded-lg">
                    {Object.keys(AVAILABLE_ICONS).map((iconName) => (
                      <label key={iconName} className="cursor-pointer">
                        <input 
                          type="radio" 
                          name="folder_icon" 
                          value={iconName}
                          checked={folderForm.icon === iconName}
                          onChange={(e) => setFolderForm({ ...folderForm, icon: e.target.value })}
                          className="peer hidden"
                        />
                        <div className="p-2 rounded-lg border border-transparent peer-checked:border-orange-500 peer-checked:bg-orange-50 hover:bg-white transition-all flex items-center justify-center">
                          <DynamicIcon name={iconName} className="w-5 h-5 text-gray-600 peer-checked:text-orange-600" />
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="pt-4 flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsFolderModalOpen(false)}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isCreating}
                    className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isCreating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      editingFolder ? 'Save Changes' : 'Create Folder'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Category Assignment Modal */}
        {isAssignCategoryModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setIsAssignCategoryModalOpen(false)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {itemsToCategorize.some(i => i.type === 'folder' && folders.find(f => f.id === i.id)?.category_id) 
                      ? 'Manage Category' 
                      : 'Assign Category'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Manage and assign categories to {itemsToCategorize.length} item(s)</p>
                </div>
                <button onClick={() => setIsAssignCategoryModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="p-4 border-b border-gray-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search categories..."
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-100 border-transparent focus:bg-white focus:border-orange-500 border rounded-xl outline-none transition-all text-sm"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                <button 
                  className="w-full flex items-center justify-between p-3 hover:bg-orange-50 rounded-xl transition-colors text-left group"
                  onClick={() => {
                    itemsToCategorize.forEach(i => updateItem(i.id, i.type, { category_id: null }));
                    setIsAssignCategoryModalOpen(false);
                    setSelectedItems([]);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <X className="w-4 h-4 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">None</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">Uncategorize items</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-orange-500 transition-colors" />
                </button>

                {categories
                  .filter(cat => cat.name.toLowerCase().includes(categorySearch.toLowerCase()))
                  .map(cat => (
                    <div key={cat.id} className="group relative">
                      <button 
                        className="w-full flex items-center justify-between p-3 hover:bg-orange-50 rounded-xl transition-colors text-left"
                        onClick={() => {
                          itemsToCategorize.forEach(i => updateItem(i.id, i.type, { category_id: cat.id }));
                          setIsAssignCategoryModalOpen(false);
                          setSelectedItems([]);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm" style={{ backgroundColor: cat.color + '20' }}>
                            <DynamicIcon name={cat.icon} className="w-4 h-4" style={{ color: cat.color }} />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{cat.name}</p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Select to assign</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            className="p-2 opacity-0 group-hover:opacity-100 hover:bg-white rounded-lg transition-all"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingCategory(cat);
                              setIsCategoryModalOpen(true);
                            }}
                          >
                            <Edit2 className="w-3.5 h-3.5 text-gray-400 hover:text-orange-600" />
                          </button>
                          <button 
                            className="p-2 opacity-0 group-hover:opacity-100 hover:bg-white rounded-lg transition-all text-red-400 hover:text-red-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmModal({
                                isOpen: true,
                                title: 'Delete Category',
                                message: 'Are you sure you want to delete this category? Folders in this category will be uncategorized.',
                              onConfirm: async () => {

                   // 1. Remove category from all folders
                   const allFolders = await dbService.getFolders(true);
                   const allFiles = await dbService.getDocs();

                   for (const f of allFolders) {
                     if (String(f.category_id) === String(cat.id)) {
                     await dbService.saveFolder({
                     ...f,
                     category_id: null
                   });
                  }
                }

                    for (const file of allFiles) {
  if (String(file.category_id) === String(cat.id)) {
    await dbService.saveDocument({
      ...file,
      category_id: null
    });
  }
}

// 2. Delete category
await dbService.deleteCategory(cat.id);

await fetchCategories();
await fetchDeletedCategories();
// small sync delay (Electron IPC stabilization)
await new Promise(res => setTimeout(res, 50));

await fetchData();


  setConfirmModal(prev => ({ ...prev, isOpen: false }));
}
                              });
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-orange-500 transition-colors" />
                        </div>
                      </button>
                    </div>
                  ))}
              </div>

              <div className="p-4 bg-gray-50 border-t border-gray-100">
                <button 
                  onClick={() => {
                    setEditingCategory(null);
                    setIsCategoryModalOpen(true);
                  }}
                  className="w-full py-3 bg-white border-2 border-dashed border-gray-200 rounded-xl text-sm font-bold text-gray-500 hover:border-orange-500 hover:text-orange-600 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create New Category
                </button>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-2">Bulk Create</p>
                  <textarea 
                    placeholder="Paste category names (one per line)..."
                    className="w-full h-24 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.ctrlKey) {
                        const names = e.currentTarget.value.split('\n').map(n => n.trim()).filter(n => n.length > 0);
                        if (names.length > 0) {
                          Promise.all(names.map(name => 
                            fetch('/api/categories', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ name, color: `#${Math.floor(Math.random()*16777215).toString(16)}` })
                            })
                          )).then(() => {
                            fetchCategories();
                            e.currentTarget.value = '';
                          });
                        }
                      }
                    }}
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Press Ctrl+Enter to bulk create</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {isCategoryModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-lg font-bold">{editingCategory ? 'Edit Category' : 'New Category'}</h3>
                <div className="flex items-center gap-2">
                  {editingCategory && (
                    <button 
                      onClick={() => {
                        setConfirmModal({
                          isOpen: true,
                          title: 'Delete Category',
                          message: 'Are you sure you want to delete this category? Folders in this category will be uncategorized.',
                          onConfirm: async () => {
                            await dbService.deleteCategory(editingCategory.id);
                            await fetchCategories();
                            await fetchDeletedCategories();
                            await fetchData();
                            setIsCategoryModalOpen(false);
                            setConfirmModal(prev => ({ ...prev, isOpen: false }));
                          }
                        });
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                  <button onClick={() => setIsCategoryModalOpen(false)} className="text-gray-400 hover:text-gray-900">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const name = formData.get('name') as string;
                const color = formData.get('color') as string;
                const icon = formData.get('icon') as string;
                
                if (editingCategory) {
  await dbService.updateCategory(editingCategory.id, {
    name,
    color,
    icon
  });

  await fetchCategories();
  setIsCategoryModalOpen(false);

} else {
  const cat = await dbService.addCategory(name, color, icon);

  await fetchCategories();
  setIsCategoryModalOpen(false);

  if (isFolderModalOpen && cat?.id) {
    setFolderForm(prev => ({
      ...prev,
      category_id: cat.id
    }));
  }
}
              }} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Category Name</label>
                  <input 
                    name="name" 
                    type="text" 
                    required 
                    defaultValue={editingCategory?.name}
                    placeholder="e.g. Legal, Finance"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Label Color</label>
                  <div className="flex gap-3 items-center">
                    <input 
                      name="color" 
                      type="color" 
                      defaultValue={editingCategory?.color || '#F97316'}
                      className="w-12 h-12 rounded-lg border-none p-0 cursor-pointer overflow-hidden"
                    />
                    <span className="text-sm text-gray-500">Choose a color for the sidebar label</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Category Icon</label>
                  <div className="grid grid-cols-5 gap-2 max-h-40 overflow-y-auto p-2 bg-gray-50 rounded-lg border border-gray-200">
                    {Object.keys(AVAILABLE_ICONS).map(iconName => (
                      <label key={iconName} className="cursor-pointer">
                        <input 
                          type="radio" 
                          name="icon" 
                          value={iconName} 
                          defaultChecked={editingCategory?.icon === iconName || (!editingCategory && iconName === 'Tag')}
                          className="peer hidden"
                        />
                        <div className="p-3 rounded-lg border border-transparent peer-checked:border-orange-500 peer-checked:bg-orange-50 hover:bg-white transition-all flex items-center justify-center">
                          <DynamicIcon name={iconName} className="w-5 h-5 text-gray-600 peer-checked:text-orange-600" />
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="pt-4 flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsCategoryModalOpen(false)}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700"
                  >
                    {editingCategory ? 'Save Changes' : 'Create Category'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isFileModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-lg font-bold">Edit File</h3>
                <button onClick={() => setIsFileModalOpen(false)} className="text-gray-400 hover:text-gray-900">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const name = formData.get('name') as string;
                
                if (editingFile) {
                  fetch(`/api/files/${editingFile.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name })
                  }).then(() => {
                    fetchData();
                    setIsFileModalOpen(false);
                  });
                }
              }} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">File Name</label>
                  <input 
                    name="name" 
                    type="text" 
                    required 
                    defaultValue={editingFile?.name}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    autoFocus
                  />
                </div>
                <div className="pt-4 flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsFileModalOpen(false)}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Context Menu */}
        {contextMenu && (
          <div 
            className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-xl py-1 w-48 text-sm"
            style={{ left: contextMenu.x, top: contextMenu.y }}
            onClick={(e) => e.stopPropagation()}
          >
            {contextMenu.type === 'category' ? (
              <>
                <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100" onClick={() => {
                  setEditingCategory(contextMenu.item);
                  setIsCategoryModalOpen(true);
                  setContextMenu(null);
                }}>
                  <Edit2 className="w-4 h-4" /> Edit Category
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 text-red-600" onClick={() => {
                  setConfirmModal({
                    isOpen: true,
                    title: 'Delete Category',
                    message: 'Are you sure you want to delete this category? Folders in this category will be uncategorized.',
                    onConfirm: async () => {
                      await dbService.deleteCategory(contextMenu.item.id);
                      await fetchCategories();
                      await fetchDeletedCategories();
                      await fetchData();
                      setConfirmModal(prev => ({ ...prev, isOpen: false }));
                    }
                  });
                  setContextMenu(null);
                }}>
                  <Trash2 className="w-4 h-4" /> Delete Category
                </button>
              </>
            ) : contextMenu.item && (contextMenu.item as any).type === 'virtual' ? (
              <>
                <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-brand-50 text-brand-700 font-bold" onClick={() => {
                  setIntelligenceId(contextMenu.item.id.toString());
                  setContextMenu(null);
                }}>
                  <Search className="w-4 h-4" /> View Intelligence Report
                </button>
                <div className="h-px bg-gray-100 my-1"></div>
                <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 text-gray-400 text-xs cursor-default">
                  Profile records are system-managed
                </button>
              </>
            ) : contextMenu.type === 'empty' ? (
              <>
                <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100" onClick={() => {
                  setEditingFolder(null);
                  setFolderForm({ name: '', category_id: activeCategory?.id || '', parent_id: currentFolder?.id || null, icon: 'Folder' });
                  setIsFolderModalOpen(true);
                  setContextMenu(null);
                }}>
                  <Plus className="w-4 h-4" /> New Folder
                </button>
                {clipboard && (
                  <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100" onClick={() => {
                    pasteItem(currentFolder?.id || null);
                    setContextMenu(null);
                  }}>
                    <ClipboardPaste className="w-4 h-4" /> Paste Here
                  </button>
                )}
              </>
            ) : (
              <>
                {contextMenu.type === 'file' && (
                  <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 text-left" onClick={() => {
                    openDocument(contextMenu.item);
                    setContextMenu(null);
                  }}>
                    <Eye className="w-4 h-4" /> View / Open File
                  </button>
                )}
                <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100" onClick={() => {
                  if (contextMenu.type === 'folder') {
                    setEditingFolder(contextMenu.item);
                    setFolderForm({ 
                      name: contextMenu.item.name, 
                      category_id: contextMenu.item.category_id || '', 
                      parent_id: contextMenu.item.parent_id,
                      icon: contextMenu.item.icon || 'Folder'
                    });
                    setIsFolderModalOpen(true);
                  } else {
                    setEditingFile(contextMenu.item);
                    setIsFileModalOpen(true);
                  }
                  setContextMenu(null);
                }}>
                  <Edit2 className="w-4 h-4" /> Rename / Edit
                </button>
                {contextMenu.type === 'folder' && (
                  <button 
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 text-left"
                    onClick={() => {
                      setItemsToCategorize([{ id: contextMenu.item.id, type: 'folder' }]);
                      setIsAssignCategoryModalOpen(true);
                      setContextMenu(null);
                    }}
                  >
                    <Tag className="w-4 h-4" /> {contextMenu.item.category_id ? 'Manage Category' : 'Assign Category'}
                  </button>
                )}
                {contextMenu.type === 'folder' && (
                  <button 
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 text-left"
                    onClick={() => {
                      setEditingFolder(contextMenu.item);
                      setFolderForm({ 
                        name: contextMenu.item.name, 
                        category_id: contextMenu.item.category_id || '', 
                        parent_id: contextMenu.item.parent_id,
                        icon: contextMenu.item.icon || 'Folder'
                      });
                      setIsFolderModalOpen(true);
                      setContextMenu(null);
                    }}
                  >
                    <FolderIcon className="w-4 h-4" /> Change Icon
                  </button>
                )}
                {contextMenu.type === 'folder' && (
                  <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100" onClick={() => {
                    setEditingFolder(null);
                    setFolderForm({ 
                      name: '', 
                      category_id: contextMenu.item.category_id || '', 
                      parent_id: contextMenu.item.id,
                      icon: 'Folder'
                    });
                    setIsFolderModalOpen(true);
                    setContextMenu(null);
                  }}>
                    <FolderPlus className="w-4 h-4" /> New Subfolder
                  </button>
                )}
                <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100" onClick={() => {
                  updateItem(contextMenu.item.id, contextMenu.type, { is_starred: !contextMenu.item.is_starred });
                  setContextMenu(null);
                }}>
                  <Star className={`w-4 h-4 ${contextMenu.item.is_starred ? 'text-yellow-500 fill-yellow-500' : ''}`} /> 
                  {contextMenu.item.is_starred ? 'Unstar' : 'Star'}
                </button>
                <div className="h-px bg-gray-100 my-1"></div>
                <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100" onClick={() => {
                  downloadItem(contextMenu.item, contextMenu.type);
                  setContextMenu(null);
                }}>
                  <Download className="w-4 h-4" /> Download
                </button>
                <div className="h-px bg-gray-100 my-1"></div>
                <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100" onClick={() => {
                  shareItem(contextMenu.item, contextMenu.type);
                  setContextMenu(null);
                }}>
                  <Share2 className="w-4 h-4" /> Share
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100" onClick={() => {
                  mailItem(contextMenu.item, contextMenu.type);
                  setContextMenu(null);
                }}>
                  <Mail className="w-4 h-4" /> Mail
                </button>
                <div className="h-px bg-gray-100 my-1"></div>
                <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100" onClick={() => {
                  copyItem(contextMenu.item.id, contextMenu.type, 'copy');
                  setContextMenu(null);
                }}>
                  <Copy className="w-4 h-4" /> Copy
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100" onClick={() => {
                  copyItem(contextMenu.item.id, contextMenu.type, 'cut');
                  setContextMenu(null);
                }}>
                  <Scissors className="w-4 h-4" /> Cut / Move
                </button>
                {clipboard && (
                  <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100" onClick={() => {
                    pasteItem(contextMenu.type === 'folder' ? contextMenu.item.id : contextMenu.item.folder_id);
                    setContextMenu(null);
                  }}>
                    <ClipboardPaste className="w-4 h-4" /> Paste Here
                  </button>
                )}
                <div className="h-px bg-gray-100 my-1"></div>
                <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100" onClick={() => {
                  openProperties({ item: contextMenu.item, type: contextMenu.type });
                  setContextMenu(null);
                }}>
                  <Info className="w-4 h-4" /> Properties
                </button>
                {!(contextMenu.type === 'folder' && contextMenu.item.is_locked) && (
                  <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 text-red-600" onClick={() => {
                    deleteItem(contextMenu.item.id, contextMenu.type, filter === 'trash');
                    setContextMenu(null);
                  }}>
                    <Trash2 className="w-4 h-4" /> {filter === 'trash' ? 'Delete Permanently' : 'Move to Trash'}
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </main>

      {/* Properties Modal */}
      {isPropertiesModalOpen && itemForProperties && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setIsPropertiesModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold">Properties</h3>
              <button onClick={() => setIsPropertiesModalOpen(false)} className="text-gray-400 hover:text-gray-900">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="flex flex-col items-center mb-8">
                <div className="w-24 h-24 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 border border-gray-100 shadow-sm">
                  {itemForProperties.type === 'folder' ? 
                    <DynamicIcon name={itemForProperties.item.icon || 'Folder'} className="w-12 h-12 text-orange-500" /> : 
                    <FileIcon className="w-12 h-12 text-gray-400" />
                  }
                </div>
                <h4 className="text-xl font-bold text-center break-all">{itemForProperties.item.name}</h4>
                <p className="text-sm text-gray-500 mt-1 uppercase font-bold tracking-widest">{itemForProperties.type}</p>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Created At</p>
                    <p className="text-sm font-medium text-gray-900">
                      {itemForProperties.item.created_at ? new Date(itemForProperties.item.created_at).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Last Modified</p>
                    <p className="text-sm font-medium text-gray-900">
                      {itemForProperties.item.updated_at ? new Date(itemForProperties.item.updated_at).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                  <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Size</p>
                      <p className="text-base font-bold text-gray-900">
                        {itemForProperties.type === 'folder' 
                          ? formatSize(getFolderSize(itemForProperties.item.id))
                          : formatSize(itemForProperties.item.size || 0)}
                      </p>
                    </div>
                    {itemForProperties.item.is_starred === 1 && (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-50 text-yellow-600 rounded-full text-xs font-bold border border-yellow-100">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        Starred
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => {
                      if (itemForProperties.type === 'folder') {
                        setEditingFolder(itemForProperties.item);
                        setFolderForm({ 
                          name: itemForProperties.item.name, 
                          category_id: itemForProperties.item.category_id || '', 
                          parent_id: itemForProperties.item.parent_id,
                          icon: itemForProperties.item.icon || 'Folder'
                        });
                        setIsFolderModalOpen(true);
                      } else {
                        setEditingFile(itemForProperties.item);
                        setIsFileModalOpen(true);
                      }
                      setIsPropertiesModalOpen(false);
                    }}
                    className="flex items-center justify-center gap-2 bg-white border-2 border-orange-600 text-orange-600 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-orange-50 transition-all active:scale-95"
                  >
                    <Edit2 className="w-4 h-4" /> Rename
                  </button>
                  <button 
                    onClick={() => {
                      downloadItem(itemForProperties.item, itemForProperties.type);
                    }}
                    className="flex items-center justify-center gap-2 bg-orange-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-orange-700 shadow-lg shadow-orange-200 transition-all active:scale-95"
                  >
                    <Download className="w-4 h-4" /> Download
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
              <button 
                onClick={() => setIsPropertiesModalOpen(false)}
                className="w-full py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Upload Files</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {compressedFiles.length} files selected • Total size: <span className="font-semibold text-orange-600">{formatSize(totalSize)}</span>
                  {originalSize > totalSize && (
                    <span className="ml-2 text-green-600 font-medium">
                      (Saved {formatSize(originalSize - totalSize)} • {compressionRatio}% smaller)
                    </span>
                  )}
                </p>
              </div>
              <button onClick={() => setIsUploadModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Category</label>
                  <select 
                    value={uploadCategoryId || ''}
                    onChange={e => {
                      const newCatId = e.target.value ? parseInt(e.target.value) : null;
                      setUploadCategoryId(newCatId);
                      // If a category is selected, check if the current folder belongs to it
                      if (newCatId) {
                        const currentFolderObj = allFolders.find(f => f.id === uploadFolderId);
                        if (currentFolderObj && currentFolderObj.category_id !== newCatId) {
                          setUploadFolderId(null);
                        }
                      }
                    }}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                  >
                    <option value="">No Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Folder</label>
                  <select 
                    value={uploadFolderId || ''}
                    onChange={e => setUploadFolderId(e.target.value || null)}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                  >
                    <option value="">Root Folder</option>
                    {allFolders
                      .filter(f => !uploadCategoryId || f.category_id === uploadCategoryId)
                      .map(f => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))
                    }
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">File List</h4>
                <div className="border border-gray-100 rounded-xl overflow-hidden">
                  {compressedFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-white border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <button 
                            className="p-1 hover:bg-gray-100 rounded-lg transition-all"
                            onClick={() => {
                              // Local file properties preview
                              openProperties({ 
                                item: {
                                  name: file.name,
                                  type: file.type,
                                  size: file.size,
                                  created_at: new Date().toISOString(),
                                  updated_at: new Date().toISOString(),
                                  is_starred: 0
                                }, 
                                type: 'file' 
                              });
                            }}
                            title="Local Info"
                          >
                            <Info className="w-4 h-4 text-gray-400" />
                          </button>
                          <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600">
                            {file.type.startsWith('image/') ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{file.name}</p>
                          <p className="text-xs text-gray-500">{file.type || 'Unknown type'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">{formatSize(file.size)}</p>
                        {originalSize > totalSize && file.type.startsWith('image/') && (
                          <p className="text-[10px] text-green-600 font-bold uppercase">Compressed</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <div className="flex flex-col items-start gap-1">
                <button 
                  onClick={compressFiles}
                  disabled={isCompressing || (originalSize > totalSize && totalSize > 0)}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    isCompressing || (originalSize > totalSize && totalSize > 0)
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                      : 'bg-white border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white'
                  }`}
                >
                  {isCompressing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                      Compressing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Compress Lossless
                    </>
                  )}
                </button>
                {!compressedFiles.some(f => f.type.startsWith('image/')) && (
                  <p className="text-[10px] text-gray-400 ml-1">Images only (Docs skip)</p>
                )}
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleFinalUpload}
                  disabled={isCreating}
                  className="flex items-center gap-2 px-8 py-2.5 bg-orange-600 text-white rounded-xl text-sm font-bold hover:bg-orange-700 shadow-lg shadow-orange-200 transition-all disabled:opacity-50"
                >
                  {isCreating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Upload {compressedFiles.length} Files
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold mb-2">{confirmModal.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{confirmModal.message}</p>
            </div>
            <div className="p-6 bg-gray-50 flex gap-3">
              <button 
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="flex-1 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={confirmModal.onConfirm}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Toast Notification */}
      {toastState && (
        <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border animate-in slide-in-from-right duration-300 ${
          toastState.type === 'success' ? 'bg-green-50 border-green-100 text-green-800' : 'bg-red-50 border-red-100 text-red-800'
        }`}>
          {toastState.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <Info className="w-5 h-5" />}
          <span className="text-sm font-medium">{toastState.message}</span>
          <button onClick={() => setToast(null)} className="p-1 hover:bg-black/5 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Intelligence Modal */}
      {intelligenceId && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-10 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
              <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden max-h-full flex flex-col relative">
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-brand-50/50">
                      <div className="flex items-center gap-2 text-brand-600">
                        <Search size={20} />
                        <h3 className="font-bold text-slate-800 uppercase tracking-tight">Profile Intelligence: {intelligenceId}</h3>
                      </div>
                      <button 
                        onClick={() => setIntelligenceId(null)}
                        className="p-2 hover:bg-slate-200 rounded-full transition-all text-slate-500"
                      >
                          <X size={24} />
                      </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-50/50">
                       <CentralizedIntelligence id={intelligenceId} showSearch={false} onClose={() => setIntelligenceId(null)} />
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}
