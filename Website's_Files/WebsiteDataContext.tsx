import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from 'react';
import { Property, Agent, AgentApplication, Client, Lead, ClientInvestment, Referral } from '../types';
import { PROPERTIES, AGENTS, CLIENTS, LEADS } from '../constants';
import { generateMetadata } from '../utils/metadataGenerator';
import { notifyNewLead } from "../leadNotifier";
import { BlogPost, PublishStatus, LegalPageType, SEOPageSnapshot } from '../types';
import { runSeoAudit } from "../utils/seoAudit";
import { calculateAdvancedScore } from "../utils/scoreEngine";
import { metadataToSnapshot } from "../utils/metadataGenerator";
import { runFullSeoCrawl } from "../seo-manager/engine/seoRunner";
import { fetchProperties, savePropertyToAPI } from "../services/api";

type SearchEntityType =
  | "property"
  | "blog"
  | "legal"
  | "agent"
  | "client";

export interface SearchItem {
  id: string;
  type: SearchEntityType;
  title: string;
  subtitle?: string;
  keywords: string[];
  url: string;
  raw: any;
}

interface DataContextType {
  properties: Property[];
  agents: Agent[];
  applications: AgentApplication[];
  clients: Client[];
  investors: any[];
  docs: any[];
  leads: Lead[];
  referrals: Referral[];
  transactions: any[];
  blogs: BlogPost[];
  legalPages: BlogPost[];
  getLegalPage: (type: LegalPageType) => BlogPost | undefined;
  addBlog: (blog: BlogPost) => void;
  updateBlog: (id: string, updates: Partial<BlogPost>) => void;
  deleteBlog: (id: string) => void;
  addProperty: (property: Property) => void;
  updateProperty: (id: string, updates: Partial<Property>) => void;
  deleteProperty: (id: string) => void;
  addAgent: (agent: Agent) => void;
  updateAgent: (id: string, updates: Partial<Agent>) => void;
  deleteAgent: (id: string) => void;
  addApplication: (application: AgentApplication) => void;
  updateApplicationStatus: (id: string, status: 'approved' | 'rejected') => void;
  removeApplication: (id: string) => void;
  addLead: (lead: Lead) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  incrementPropertyView: (id: string) => void;
  addClient: (client: Client) => void;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  assignPlotToClient: (propertyId: string, plotId: string, clientDetails: { name: string, phone: string, amount?: number, status: string }) => void;
  addReferral: (referral: Referral) => void;
  updateReferral: (id: string, updates: Partial<Referral>) => void;
  deleteReferral: (id: string) => void;
  addDoc: (doc: any) => void;
  pullFromCloud: () => Promise<string[]>;
  seoSnapshots: SEOPageSnapshot[];
  runSeoCrawl: () => Promise<void>;
  searchIndex: SearchItem[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);

  const [agents, setAgents] = useState<Agent[]>(() => {
    const saved = localStorage.getItem("agents");
    return saved ? JSON.parse(saved) : AGENTS;
  });

  const [applications, setApplications] = useState<AgentApplication[]>(() => {
    const saved = localStorage.getItem("applications");
    return saved ? JSON.parse(saved) : [];
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem("clients");
    return saved ? JSON.parse(saved) : CLIENTS;
  });

  const [transactions, setTransactions] = useState<any[]>([]);

  const [investors, setInvestors] = useState<any[]>(() => {
    const saved = localStorage.getItem("investors");
    return saved ? JSON.parse(saved) : [];
  });

  const [docs, setDocs] = useState<any[]>(() => {
    const saved = localStorage.getItem("docs");
    return saved ? JSON.parse(saved) : [];
  });

  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem("leads");
    return saved ? JSON.parse(saved) : LEADS;
  });

  const [referrals, setReferrals] = useState<Referral[]>(() => {
    const saved = localStorage.getItem("referrals");
    return saved ? JSON.parse(saved) : [];
  });

  const [blogs, setBlogs] = useState<BlogPost[]>(() => {
  const saved = localStorage.getItem("blogs");
  if (!saved) return [];

  const parsed = JSON.parse(saved);

  return parsed.map((b: any) => {
  const categories =
    Array.isArray(b.categories)
      ? b.categories
      : b.category
      ? [typeof b.category === "string" ? b.category : b.category.name]
      : ["Uncategorized"];

  return {
    ...b,
    categories,

    seo: b.seo || {
      metaTitle: b.title || "",
      metaDescription: "",
      keywords: []
    }
  };
});
}); 

useEffect(() => {
  let mounted = true;

  const run = async () => {
    try {
      const snapshots = await runFullSeoCrawl(properties, blogs);
      if (mounted) setSeoSnapshots(snapshots);
    } catch (e) {
      console.error("SEO crawl failed", e);
    }
  };

  run();

  return () => {
    mounted = false;
  };
}, [properties, blogs]);

/* ================= SEO SNAPSHOTS (ENGINE CORE) ================= */

const [seoSnapshots, setSeoSnapshots] = useState<SEOPageSnapshot[]>([]);

// ---------- LEGAL PAGE BOOTSTRAP (SAFE) ----------

const LEGAL_PAGE_TYPES: LegalPageType[] = [
  "privacy",
  "terms",
  "refund",
  "cookies",
  "disclaimer",
  "about"
];

const LEGAL_TITLES: Record<LegalPageType, string> = {
  privacy: "Privacy Policy",
  terms: "Terms & Conditions",
  refund: "Refund Policy",
  cookies: "Cookie Policy",
  disclaimer: "Disclaimer",
  about: "About Us"
};

/*
LEGAL BOOTSTRAP — DEDUPE + CREATE MISSING (SAFE)
*/
useEffect(() => {
  setBlogs(prev => {
    const map = new Map<LegalPageType, BlogPost>();
    const normal: BlogPost[] = [];

    // ✅ 1 — DEDUPE (loop only)
    for (const b of prev) {
      if (!b.pageType) {
        normal.push(b);
        continue;
      }

      const type = b.pageType as LegalPageType;

      const existing = map.get(type);

      if (!existing) {
        map.set(type, b);
      } else {
        const existingTime = new Date(existing.updatedAt || existing.createdAt || 0).getTime();
        const newTime = new Date(b.updatedAt || b.createdAt || 0).getTime();

        if (newTime > existingTime) {
          map.set(type, b);
        }
      }
    }

    // ✅ 2 — CREATE MISSING (outside loop)
    for (const type of LEGAL_PAGE_TYPES) {
      if (!map.has(type)) {
        map.set(type, {
          id: `legal_${type}`,
          title: LEGAL_TITLES[type],
          slug: type,
          content: "",
          excerpt: "",
          author: "Admin",
          image: "",
          featuredImage: "",
          readTime: "1 min",
          categories: [],
          seo: {
            metaTitle: LEGAL_TITLES[type],
            metaDescription: "",
            keywords: []
          },
          pageType: type,
          visibility: {
            showOnBlogPage: false,
            showOnHome: false,
            featuredOnHome: false
          },
          status: PublishStatus.PUBLISHED,
          publishDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    }

    return [...map.values(), ...normal];
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

/*
PURE SELECTOR
*/
const legalPages = useMemo(() => {
  return blogs.filter(b => b.pageType);
}, [blogs]);

/* ================= GLOBAL SEARCH INDEX ================= */

const searchIndex = useMemo<SearchItem[]>(() => {
  const propertyItems: SearchItem[] = properties.map(p => ({
    id: p.id,
    type: "property",
    title: p.title,
    subtitle: p.locality,
    keywords: [
      p.title,
      p.locality,
      p.type,
      p.approval,
      ...(p.amenities || [])
    ].filter((v): v is string => Boolean(v)),
    url: `/property/${p.seo?.slug || p.id}`,
    raw: p
  }));

  const blogItems: SearchItem[] = blogs
    .filter(b => !b.pageType)
    .map(b => ({
      id: b.id,
      type: "blog",
      title: b.title,
      subtitle: b.categories?.join(", "),
      keywords: [
        b.title,
        ...(b.categories || []),
        ...(b.seo?.keywords || [])
      ].filter((v): v is string => Boolean(v)),
      url: `/blog/${b.slug}`,
      raw: b
    }));

  const legalItems: SearchItem[] = legalPages.map(p => ({
    id: p.id,
    type: "legal",
    title: p.title,
    keywords: [p.title, p.pageType || ""].filter((v): v is string => Boolean(v)),
    url: `/legal/${p.pageType}`,
    raw: p
  }));

  const agentItems: SearchItem[] = agents.map(a => ({
    id: a.id,
    type: "agent",
    title: a.name,
    subtitle: a.role,
    keywords: [a.name, a.role, a.territory].filter((v): v is string => Boolean(v)),
    url: `/admin/agents`,
    raw: a
  }));

  const clientItems: SearchItem[] = clients.map(c => ({
    id: c.id,
    type: "client",
    title: c.name,
    subtitle: c.phone,
    keywords: [c.name, c.phone].filter((v): v is string => Boolean(v)),
    url: `/admin/clients`,
    raw: c
  }));

  return [
    ...propertyItems,
    ...blogItems,
    ...legalItems,
    ...agentItems,
    ...clientItems
  ];
}, [properties, blogs, legalPages, agents, clients]);

const getLegalPage = useCallback((type: LegalPageType) => {
  return blogs.find(b => b.pageType === type);
}, [blogs]);


  useEffect(() => {
    localStorage.setItem("agents", JSON.stringify(agents));
  }, [agents]);

  useEffect(() => {
    localStorage.setItem("applications", JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    localStorage.setItem("clients", JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem("leads", JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem("referrals", JSON.stringify(referrals));
  }, [referrals]);

  useEffect(() => {
    localStorage.setItem("investors", JSON.stringify(investors));
  }, [investors]);

  useEffect(() => {
    try {
      localStorage.setItem("docs", JSON.stringify(docs.map((d: any) => {
        const { fileData, ...rest } = d;
        return rest;
      })));
    } catch {}
  }, [docs]);

  useEffect(() => {
  localStorage.setItem("blogs", JSON.stringify(blogs));
  }, [blogs]);

  // 🔥 PULL FROM CLOUD — Manual trigger (login or "Pull from Cloud" button)
  const pullFromCloud = useCallback(async () => {
    const BACKEND_URL = 'https://ashray-backend-2nt7.onrender.com';
    const results: string[] = [];
    try {
      const fetches = await Promise.allSettled([
        fetch(`${BACKEND_URL}/api/property/all`).then(async r => { if (r.ok) return r.json(); throw new Error(r.statusText); }),
        fetch(`${BACKEND_URL}/api/client/all`).then(async r => { if (r.ok) return r.json(); throw new Error(r.statusText); }),
        fetch(`${BACKEND_URL}/api/transaction/all`).then(async r => { if (r.ok) return r.json(); throw new Error(r.statusText); }),
        fetch(`${BACKEND_URL}/api/investor/all`).then(async r => { if (r.ok) return r.json(); throw new Error(r.statusText); }),
        fetch(`${BACKEND_URL}/api/doc/all`).then(async r => { if (r.ok) return r.json(); throw new Error(r.statusText); }),
        fetch(`${BACKEND_URL}/api/referral/all`).then(async r => { if (r.ok) return r.json(); throw new Error(r.statusText); }),
      ]);

      const [propRes, clientRes, txRes, investorRes, docRes, refRes] = fetches.map(r => r.status === 'fulfilled' ? r.value : null);

      console.log("☁️ Pull from cloud:", {
        props: Array.isArray(propRes) ? propRes.length : 'FAILED',
        clients: Array.isArray(clientRes) ? clientRes.length : 'FAILED',
        transactions: Array.isArray(txRes) ? txRes.length : 'FAILED',
        investors: Array.isArray(investorRes) ? investorRes.length : 'FAILED',
        docs: Array.isArray(docRes) ? docRes.length : 'FAILED',
        referrals: Array.isArray(refRes) ? refRes.length : 'FAILED'
      });

      if (Array.isArray(propRes)) setProperties(propRes);
      if (Array.isArray(clientRes)) {
        setClients(prev => {
          const map = new Map(prev.map(c => [c.id, c]));
          clientRes.forEach((c: any) => map.set(c.id, c));
          return Array.from(map.values());
        });
        results.push(`${clientRes.length} clients`);
      }
      if (Array.isArray(txRes)) { setTransactions(txRes); results.push(`${txRes.length} transactions`); }
      if (Array.isArray(investorRes)) {
        setInvestors(prev => {
          const map = new Map(prev.map((i: any) => [i.id, i]));
          investorRes.forEach((i: any) => map.set(i.id, i));
          return Array.from(map.values());
        });
        results.push(`${investorRes.length} investors`);
      }
      if (Array.isArray(docRes)) {
        setDocs(prev => {
          const map = new Map(prev.map((d: any) => [d.id, d]));
          docRes.forEach((d: any) => map.set(d.id, d));
          return Array.from(map.values());
        });
        results.push(`${docRes.length} docs`);
      }
      if (Array.isArray(refRes)) {
        setReferrals(prev => {
          const map = new Map(prev.map(r => [r.id, r]));
          refRes.forEach((r: any) => map.set(r.id, r));
          return Array.from(map.values());
        });
        results.push(`${refRes.length} referrals`);
      }
    } catch (err) {
      console.log("⚠️ Pull from cloud failed:", err);
    } finally {
      setIsHydrated(true);
    }
    return results;
  }, []);

  // Only hydrate from localStorage on first load (no backend fetch)
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // --- ACTIONS WITH MEMOIZATION ---

  const addProperty = useCallback((property: Property) => {
    const seo = generateMetadata({
      title: property.title,
      locality: property.locality,
      type: property.type,
      size: property.plotSize,
      approval: property.approval,
      id: property.id,
      price: property.price
    });
    
    const safeImages = property.images && property.images.length
      ? property.images
      : ['https://picsum.photos/800/600?random=' + Date.now()];

    const imageAlts = safeImages.map((_, i) => 
      `${property.type} for sale in ${property.locality} Nagpur - View ${i+1}`
    );

    const audit = runSeoAudit({
      title: seo.metaTitle,
      description: seo.metaDescription,
      content: property.description,
      keywords: seo.keywords
    });

const advanced = calculateAdvancedScore(audit);

    const optimizedProperty: Property = {
      ...property,
      images: safeImages,
      id: property.id || `p_${Date.now()}`,  
      seo: {
        ...seo,
        slug: seo.slug || `${property.title}-${property.locality}`.toLowerCase().replace(/[^a-z0-9]+/g, "-")
      },
      imageAlts,
      ratePerSqft: Math.round(property.price / property.plotSize),
      status: "Available",
      stats: { views: 0, enquiries: 0 },
      priceHistory: [{ price: property.price, date: new Date().toISOString(), note: "Initial Listing" }],
      seoScore: advanced.total
    };

    // ✅ STEP 1: UPDATE UI IMMEDIATELY (LOCAL FIRST)
setProperties(prev => {
  const exists = prev.find(p => p.id === optimizedProperty.id);
  if (exists) return prev;
  return [optimizedProperty, ...prev];
});

// ✅ STEP 2: BACKGROUND SYNC (NO UI IMPACT)
savePropertyToAPI(optimizedProperty)
  .then((serverVersion) => {
    if (!serverVersion) return;

    // ✅ STEP 3: SOFT MERGE (NO REPLACEMENT)
    setProperties(prev =>
      prev.map(p =>
        p.id === serverVersion.id
          ? { ...p, ...serverVersion }
          : p
      )
    );
  })
  .catch(() => {
    console.log("⚠️ API SAVE FAILED (offline safe)");
  });
  }, []);

  const addBlog = useCallback((blog: BlogPost) => {
  const slug =
    blog.slug ||
    blog.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

  const normalizedCategories =
    Array.isArray(blog.categories) && blog.categories.length
      ? blog.categories
      : ["Uncategorized"];

  const optimizedBlog: BlogPost = {
  ...blog,
  slug,
  categories: normalizedCategories,

  seo: blog.seo || {
    metaTitle: blog.title,
    metaDescription: "",
    keywords: []
  },

  updatedAt: new Date().toISOString(),
};

  const audit = runSeoAudit({
    title: optimizedBlog.seo?.metaTitle || optimizedBlog.title,
    description: optimizedBlog.seo?.metaDescription || "",
    content: optimizedBlog.content || "",
    keywords: optimizedBlog.seo?.keywords || []
  });

  const advanced = calculateAdvancedScore(audit);
  optimizedBlog.seoScore = advanced.total;

  setBlogs(prev => {
    // ⭐⭐⭐ CRITICAL: legal page overwrite
    if (optimizedBlog.pageType) {
      const filtered = prev.filter(
        p => p.pageType !== optimizedBlog.pageType
      );
      return [optimizedBlog, ...filtered];
    }

    // normal blog
    return [optimizedBlog, ...prev];
  });
}, []);


  const updateBlog = useCallback((id: string, updates: Partial<BlogPost>) => {
  setBlogs(prev =>
    prev.map(b => {
      if (b.id !== id) return b;

      const merged: BlogPost = {
        ...b,
        ...updates,

        // 🔴 CRITICAL — NEVER LOSE LEGAL CORE FIELDS
        id: b.id,
        pageType: b.pageType,
        createdAt: b.createdAt,
        publishDate: b.publishDate,

        seo: updates.seo || b.seo,

        categories:
          updates.categories !== undefined
            ? updates.categories
            : b.categories,

        updatedAt: new Date().toISOString()
      };

      const audit = runSeoAudit({
        title: merged.seo?.metaTitle || merged.title,
        description: merged.seo?.metaDescription || "",
        content: merged.content || "",
        keywords: merged.seo?.keywords || []
      });

      const advanced = calculateAdvancedScore(audit);
      merged.seoScore = advanced.total;

      return merged;
    })
  );
}, []);

  const deleteBlog = useCallback((id: string) => {
  setBlogs(prev =>
    prev.map(b =>
      b.id === id
        ? {
            ...b,
            trashedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        : b
    )
  );
}, []);

  const updateProperty = useCallback((id: string, updates: Partial<Property>) => {
    setProperties(prev => prev.map(p => {
      if (p.id === id) {
        let newHistory = p.priceHistory;
        if (updates.price && updates.price !== p.price) {
          newHistory = [...(p.priceHistory || []), { price: updates.price, date: new Date().toISOString(), note: 'Price Updated' }];
        }
        const next: Property = { ...p, ...updates, priceHistory: newHistory };

          if (next.seo) {
            const audit = runSeoAudit({
              title: next.seo.metaTitle || "",
              description: next.seo.metaDescription || "",
              content: next.description || "",
              keywords: next.seo.keywords || []
         });

         const advanced = calculateAdvancedScore(audit);
         next.seoScore = advanced.total;
       }

// ✅ BACKGROUND API SYNC
savePropertyToAPI(next)
  .then((serverVersion) => {
    if (!serverVersion) return;

    setProperties(prev =>
      prev.map(p =>
        p.id === serverVersion.id
          ? { ...p, ...serverVersion }
          : p
      )
    );
  })
  .catch(() => {
    console.log("⚠️ API UPDATE FAILED");
  });

       return next;
      }
      return p;
    }));
  }, []);
  
  const deleteProperty = useCallback((id: string) => setProperties(prev => prev.filter(p => p.id !== id)), []);

  const incrementPropertyView = useCallback((id: string) => {
    setProperties(prev => prev.map(p => 
      p.id === id ? { ...p, stats: { ...p.stats, views: (p.stats?.views || 0) + 1 } } : p
    ));
  }, []);

  const addAgent = useCallback((agent: Agent) => setAgents(prev => [...prev, agent]), []);
  const updateAgent = useCallback((id: string, updates: Partial<Agent>) => {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  }, []);
  const deleteAgent = useCallback((id: string) => setAgents(prev => prev.filter(a => a.id !== id)), []);

  const addApplication = useCallback((application: AgentApplication) => setApplications(prev => [...prev, application]), []);
  const updateApplicationStatus = useCallback((id: string, status: 'approved' | 'rejected') => {
    setApplications(prev => prev.map(app => app.id === id ? { ...app, status } : app));
  }, []);
  const removeApplication = useCallback((id: string) => setApplications(prev => prev.filter(app => app.id !== id)), []);

  const addLead = useCallback((lead: Lead) => {
  const now = new Date().toISOString();

  const matchedProperty = properties.find(p =>
    lead.interest?.toLowerCase().includes(p.title.toLowerCase())
  );

  const enrichedLead: Lead = {
    ...lead,

    propertyTitle: matchedProperty?.title || lead.propertyTitle,
    locality: matchedProperty?.locality || lead.locality,

    createdAt: now,
    updatedAt: now,

    lastAgentAction: "Lead created",

    activity: [
      {
        id: `act_${Date.now()}`,
        date: now,
        type: "created",
        payload: {}
      }
    ]
  };

  setLeads(prev => [enrichedLead, ...prev]);

  if (matchedProperty) {
    updateProperty(matchedProperty.id, {
      stats: {
        ...matchedProperty.stats,
        enquiries: (matchedProperty.stats?.enquiries || 0) + 1
      }
    });
  }
}, [properties, updateProperty]);



const updateLead = useCallback((id: string, updates: Partial<Lead>) => {
  const now = new Date().toISOString();

  setLeads(prev =>
    prev.map(l => {
      if (l.id !== id) return l;

      const activityType: NonNullable<Lead["activity"]>[number]["type"] =
        updates.assignedAgentId
          ? "assignment"
          : updates.status
          ? "status_change"
          : updates.notes
          ? "note"
          : "update";

      const activityEntry: NonNullable<Lead["activity"]>[number] = {
        id: `act_${Date.now()}`,
        date: now,
        type: activityType,
        payload: updates
      };

      const lastAgentAction =
        typeof updates.status === "string"
          ? updates.status
          : updates.assignedAgentId
          ? "Lead assigned"
          : typeof updates.notes === "string"
          ? updates.notes
          : l.lastAgentAction ?? null;

      return {
        ...l,
        ...updates,

        updatedAt: now,

        lastAgentAction,

        activity: [activityEntry, ...(l.activity ?? [])]
      };
    })
  );
}, []);

  const deleteLead = useCallback((id: string) => setLeads(prev => prev.filter(l => l.id !== id)), []);

  const addClient = useCallback((client: Client) => {
    setClients(prev => [client, ...prev]);
    fetch('https://ashray-backend-2nt7.onrender.com/api/client/bulk-upsert', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([client])
    }).catch(() => {});
  }, []);
  const updateClient = useCallback((id: string, updates: Partial<Client>) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    fetch('https://ashray-backend-2nt7.onrender.com/api/client/bulk-upsert', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([{ id, ...updates }])
    }).catch(() => {});
  }, []);
  const deleteClient = useCallback((id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
    fetch('https://ashray-backend-2nt7.onrender.com/api/client/bulk-upsert', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([{ id, is_deleted: true }])
    }).catch(() => {});
  }, []);

  const addReferral = useCallback((referral: Referral) => {
    setReferrals(prev => [referral, ...prev]);
    fetch('https://ashray-backend-2nt7.onrender.com/api/referral/upsert', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(referral)
    }).catch(() => {});
  }, []);
  const updateReferral = useCallback((id: string, updates: Partial<Referral>) => {
    setReferrals(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
    fetch('https://ashray-backend-2nt7.onrender.com/api/referral/upsert', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates })
    }).catch(() => {});
  }, []);
  const deleteReferral = useCallback((id: string) => {
    setReferrals(prev => prev.filter(r => r.id !== id));
    fetch('https://ashray-backend-2nt7.onrender.com/api/referral/upsert', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_deleted: true })
    }).catch(() => {});
  }, []);

  const addDoc = useCallback((doc: any) => {
    setDocs(prev => {
      if (prev.find((existing: any) => existing.id === doc.id)) return prev;
      return [...prev, doc];
    });
    fetch('https://ashray-backend-2nt7.onrender.com/api/doc/bulk-upsert', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([doc])
    }).catch(() => {});
  }, []);

  const assignPlotToClient = useCallback((propertyId: string, plotId: string, clientDetails: { name: string, phone: string, amount?: number, status: string }) => {
    const property = properties.find(p => p.id === propertyId);
    if (property && property.inventory) {
      const updatedInventory = property.inventory.map(plot => {
        if (plot.id === plotId) {
          return { ...plot, status: clientDetails.status as any, buyerName: clientDetails.name, buyerPhone: clientDetails.phone };
        }
        return plot;
      });
      updateProperty(propertyId, { inventory: updatedInventory });
    }

    if (clientDetails.status === 'Available') return;

    const existingClientIndex = clients.findIndex(c => c.phone.replace(/\D/g,'') === clientDetails.phone.replace(/\D/g,''));
    const newInvestment: ClientInvestment = {
      propertyId,
      plotId,
      amount: clientDetails.amount || 0,
      purchaseDate: new Date().toISOString().split('T')[0]
    };

    if (existingClientIndex > -1) {
      const updatedClients = [...clients];
      const client = updatedClients[existingClientIndex];
      const hasInvestment = client.investments?.some(inv => inv.plotId === plotId && inv.propertyId === propertyId);
      if (!hasInvestment) {
        client.investments = [...(client.investments || []), newInvestment];
        client.totalAmount += (clientDetails.amount || 0);
        setClients(updatedClients);
      }
    } else {
      const newClient: Client = {
        id: `c_${Date.now()}`,
        name: clientDetails.name,
        phone: clientDetails.phone,
        email: '', 
        username: clientDetails.name.toLowerCase().replace(/\s+/g, '') + Math.floor(Math.random()*100),
        password: 'password123',
        totalAmount: clientDetails.amount || 0,
        investments: [newInvestment],
        documents: [],
        payments: []
      };
      addClient(newClient);
    }
  }, [properties, clients, updateProperty, addClient]);

  const runSeoCrawl = useCallback(async () => {
      try {
        const snapshots = await runFullSeoCrawl(properties, blogs);
        setSeoSnapshots(snapshots);
      } catch (e) {
        console.error("Manual SEO crawl failed", e);
      }
    }, [properties, blogs]);


  if (!isHydrated) return null;

  return (
    <DataContext.Provider value={{
      properties, agents, applications, clients, investors, docs, leads, referrals, transactions,
      blogs, addBlog, updateBlog, deleteBlog,
      addProperty, updateProperty, deleteProperty,
      addAgent, updateAgent, deleteAgent,
      addApplication, updateApplicationStatus, removeApplication,
      addLead, updateLead, deleteLead,
      incrementPropertyView,
      addClient, updateClient, deleteClient,
      assignPlotToClient,
      addReferral, updateReferral, deleteReferral, addDoc, pullFromCloud,
      legalPages, getLegalPage, seoSnapshots, runSeoCrawl, searchIndex,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};