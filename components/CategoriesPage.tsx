import React, { useState, useEffect } from 'react';
import { dbService } from '../services/db';
import { 
  ArrowLeft, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Tag, 
  X,
  RefreshCw,
  Folder as FolderIcon,
  File as FileIcon,
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
  Zap,
  MoreVertical,
  CheckCircle2
} from 'lucide-react';

const DynamicIcon = ({ name, className, style }: { name: string, className?: string, style?: React.CSSProperties }) => {
  const icons: { [key: string]: any } = {
    Folder: FolderIcon,
    File: FileIcon,
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
    Zap,
    Tag
  };
  const IconComponent = icons[name] || Tag;
  return <IconComponent className={className} style={style} />;
};

interface Category {
  id: number;
  name: string;
  color: string;
  icon: string;
  created_at: string;
}

interface CategoriesPageProps {
  onBack: () => void;
}

export default function CategoriesPage({ onBack }: CategoriesPageProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', color: '#f97316', icon: 'Tag' });
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const fetchCategories = async () => {
    try {
      const categories = await dbService.getCategories();
      setCategories(categories);
    } catch (err) {
      console.error('Categories fetch error:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingCategory) {
        await dbService.updateCategory(editingCategory.id, form);
      } else {
        await dbService.addCategory(form.name, form.color, form.icon);
      }
      fetchCategories();
      setIsModalOpen(false);
      setEditingCategory(null);
      setForm({ name: '', color: '#f97316', icon: 'Tag' });
    } catch (err: any) {
      console.error('Error saving category:', err);
      alert(`Failed to save category: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await dbService.deleteCategory(id);
      fetchCategories();
      setConfirmDelete(null);
    } catch (err: any) {
      console.error('Error deleting category:', err);
      alert(`Failed to delete category: ${err.message}`);
    }
  };

  const filteredCategories = categories.filter(c => 
    (c.name || '').toLowerCase().includes((search || '').toLowerCase())
  );

  const iconOptions = [
    'Tag', 'Briefcase', 'Shield', 'FileText', 'ImageIcon', 'Music', 'Video', 
    'Archive', 'Book', 'Calendar', 'CreditCard', 'Database', 'Mail', 'Map', 
    'MessageSquare', 'Package', 'ShoppingCart', 'User', 'Users', 'Zap'
  ];

  const colorOptions = [
    '#f97316', '#ef4444', '#ec4899', '#a855f7', '#6366f1', 
    '#3b82f6', '#06b6d4', '#10b981', '#22c55e', '#84cc16',
    '#eab308', '#71717a'
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 h-16 flex items-center px-8 shrink-0 sticky top-0 z-10">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full mr-4 transition-colors text-gray-600"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <Tag className="w-6 h-6 text-orange-600" />
          <h1 className="text-xl font-bold tracking-tight">Manage Categories</h1>
        </div>
        
        <div className="flex-1 max-w-md mx-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search categories..." 
            className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-orange-500 text-sm transition-all"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <button 
          onClick={() => {
            setEditingCategory(null);
            setForm({ name: '', color: '#f97316', icon: 'Tag' });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md active:scale-95"
        >
          <Plus className="w-4 h-4" />
          New Category
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 p-8 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map(cat => (
            <div 
              key={cat.id}
              className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all group flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: `${cat.color}15` }}
                >
                  <DynamicIcon name={cat.icon} className="w-6 h-6" style={{ color: cat.color }} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{cat.name}</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                    Created {new Date(cat.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => {
                    setEditingCategory(cat);
                    setForm({ name: cat.name, color: cat.color, icon: cat.icon });
                    setIsModalOpen(true);
                  }}
                  className="p-2 hover:bg-orange-50 text-gray-400 hover:text-orange-600 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setConfirmDelete(cat.id)}
                  className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {filteredCategories.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Tag className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">No categories found</h3>
              <p className="text-gray-500 max-w-xs mx-auto mt-1">
                {search ? "Try a different search term or create a new category." : "Start by creating your first category to organize your files."}
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-900">{editingCategory ? 'Edit Category' : 'New Category'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Category Name</label>
                <input 
                  type="text" 
                  required
                  autoFocus
                  placeholder="e.g. Personal, Work, Projects"
                  className="w-full px-4 py-3 bg-gray-100 border-transparent focus:bg-white focus:border-orange-500 border-2 rounded-xl outline-none transition-all font-medium"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Pick an Icon</label>
                <div className="grid grid-cols-5 gap-2 max-h-40 overflow-y-auto p-1 custom-scrollbar">
                  {iconOptions.map(iconName => (
                    <button 
                      key={iconName}
                      type="button"
                      onClick={() => setForm({ ...form, icon: iconName })}
                      className={`p-3 rounded-xl border-2 transition-all flex items-center justify-center ${form.icon === iconName ? 'border-orange-500 bg-orange-50 text-orange-600 scale-110 shadow-sm' : 'border-transparent bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                    >
                      <DynamicIcon name={iconName} className="w-5 h-5" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Pick a Color</label>
                <div className="flex flex-wrap gap-3">
                  {colorOptions.map(color => (
                    <button 
                      key={color}
                      type="button"
                      onClick={() => setForm({ ...form, color })}
                      className={`w-8 h-8 rounded-full transition-all flex items-center justify-center ${form.color === color ? 'ring-4 ring-orange-100 scale-125 shadow-md' : 'hover:scale-110'}`}
                      style={{ backgroundColor: color }}
                    >
                      {form.color === color && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-xl text-sm font-bold hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-orange-200"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    editingCategory ? 'Save Changes' : 'Create Category'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setConfirmDelete(null)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Delete Category?</h3>
              <p className="text-sm text-gray-500 mt-2">
                 This will move the category to Trash. Folders in this category will become uncategorized.
              </p>
              <div className="mt-8 flex gap-3">
                <button 
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleDelete(confirmDelete)}
                  className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-100"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
