import {
	Building2,
	Calendar,
	Image,
	Lock,
	Plus,
	RefreshCw,
	Save,
	Trash2,
	Upload,
	Monitor,
	Cpu,
	Radio,
	ShieldCheck,
	Download,
	FileUp,
	Clipboard,
	HardDrive,
	Wifi,
	Smartphone,
	Import,
	Copy,
	Check,
	Share2,
	Cloud,
	Globe,
	AlertTriangle,
	Activity
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { dbService } from "../services/db";
import { type AppSettings, GSTEntry, OfficeAddress, InstallationState, MachineRegistration } from "../types";

export const Settings: React.FC = () => {
	const [settings, setSettings] = useState<AppSettings | null>(null);
	const [originalSettings, setOriginalSettings] = useState<AppSettings | null>(null);
	const [installation, setInstallation] = useState<InstallationState | null>(null);
	const [machines, setMachines] = useState<MachineRegistration[]>([]);
	const [loading, setLoading] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [isOtherSelected, setIsOtherSelected] = useState(false);
	const [newCompanyAddress, setNewCompanyAddress] = useState({
		name: "",
		addressLine: "",
		locality: "",
		district: "",
		state: "",
		pinCode: "",
	});
	const [newManager, setNewManager] = useState({
		name: "",
		role: "",
		phone: "",
		countryCode: "+91",
		address: "",
		pan: "",
		aadhaar: "",
	});

	useEffect(() => {
		dbService.getSettings().then((s) => {
			const ENTITY_TYPES = [
				"Sole Proprietorship (S.P.)",
				"Private Limited Company (Pvt. Ltd.)",
				"Public Limited Company (Ltd.)",
				"Partnership Firm (P.F.)",
				"Limited Liability Partnership (LLP)",
			];

			const initialSettings = {
				companyName: "",
				entityType: "",
				panNumber: "",
				licenseRegistrationNumber: "",
				urcNumber: "",
				tanNumber: "",
				adminId: "",
				adminPassword: "",
				autoSync: true,
				backupCycleStartYear: new Date().getFullYear(),
				lastBackupDate: "",
				gstNumber: "",
				companyEmail: "",
				companyWebsite: "",
				financialYearStart: "",
				financialYearEnd: "",
				companyLogo: "",
				companyWatermark: "",
				companyAddresses: [],
				managers: [],
				...s,
			};

			setSettings(initialSettings);
			if (
				initialSettings.entityType &&
				!ENTITY_TYPES.includes(initialSettings.entityType)
			) {
				setIsOtherSelected(true);
			}
		});

		dbService.getInstallationState().then(setInstallation);
		dbService.getRegisteredMachines().then(setMachines);
	}, []);

	// Auto-populate backendUrl from CloudRelay installation state
	useEffect(() => {
		if (installation?.mode === 'CloudRelay' && installation.serverUrl && settings && !settings.backendUrl) {
			setSettings(prev => prev ? { ...prev, backendUrl: installation.serverUrl } : prev);
		}
	}, [installation, settings]);

	// Periodic auto-sync: every 5 minutes when autoSync is enabled
	useEffect(() => {
		if (!settings?.autoSync) return;
		const interval = setInterval(async () => {
			if (installation?.mode === 'Client' || installation?.mode === 'CloudRelay') {
				// Pull from cloud for client/relay machines
				try {
					const backendUrl = (settings?.backendUrl || 'https://ashray-backend-2nt7.onrender.com').replace(/\/$/, '');
					const entities = ['client', 'investor', 'property', 'transaction', 'referral', 'doc'] as const;
					for (const entity of entities) {
						const res = await fetch(`${backendUrl}/api/${entity}/all`);
						const data = await res.json();
						if (Array.isArray(data)) {
							for (const item of data) {
								const saveFn = `save${entity.charAt(0).toUpperCase() + entity.slice(1)}` as keyof typeof dbService;
								try { await (dbService as any)[saveFn](item); } catch {}
							}
						}
					}
				} catch {}
			} else {
				// Push to cloud for master/independent machines
				await dbService.syncToWebsite().catch(() => {});
			}
		}, 5 * 60 * 1000);
		return () => clearInterval(interval);
	}, [settings?.autoSync, installation?.mode]);

	const [websiteSyncing, setWebsiteSyncing] = useState(false);
	const [syncMessage, setSyncMessage] = useState<string | null>(null);
	const [cloudPulling, setCloudPulling] = useState(false);
	const [relayStatus, setRelayStatus] = useState<string>('');
	const [lastCloudSync, setLastCloudSync] = useState<string>('');

	const handleWebsiteSync = async () => {
		setWebsiteSyncing(true);
		setRelayStatus('syncing');
		setSyncMessage(null);
		try {
			const result = await dbService.syncToWebsite();
			setSyncMessage(result.message);
			setLastCloudSync(new Date().toLocaleString());
			setRelayStatus('connected');
		} catch (error) {
			setSyncMessage(
				`Sync failed: ${error instanceof Error ? error.message : String(error)}`,
			);
			setRelayStatus('error');
		} finally {
			setWebsiteSyncing(false);
			setTimeout(() => setSyncMessage(null), 5000);
		}
	};

	const handlePullFromCloud = async () => {
		setCloudPulling(true);
		setRelayStatus('syncing');
		try {
			const backendUrl = (settings?.backendUrl || 'https://ashray-backend-2nt7.onrender.com').replace(/\/$/, '');
			const res = await fetch(`${backendUrl}/api/client/all`);
			if (!res.ok) throw new Error(`Cloud relay returned ${res.status}`);
			const clients = await res.json();
			let imported = 0;
			if (Array.isArray(clients)) {
				for (const c of clients) {
					try { await dbService.saveClient(c); imported++; } catch {}
				}
			}
			// Also pull investors
			try {
				const invRes = await fetch(`${backendUrl}/api/investor/all`);
				const investors = await invRes.json();
				if (Array.isArray(investors)) {
					for (const i of investors) {
						try { await dbService.saveInvestor(i); imported++; } catch {}
					}
				}
			} catch {}
			// Pull properties
			try {
				const propRes = await fetch(`${backendUrl}/api/property/all`);
				const props = await propRes.json();
				if (Array.isArray(props)) {
					for (const p of props) {
						try { await dbService.saveProperty(p); imported++; } catch {}
					}
				}
			} catch {}
			// Pull transactions
			try {
				const txRes = await fetch(`${backendUrl}/api/transaction/all`);
				const txs = await txRes.json();
				if (Array.isArray(txs)) {
					for (const tx of txs) {
						try { await dbService.saveTransaction(tx); imported++; } catch {}
					}
				}
			} catch {}
			// Pull referrals
			try {
				const refRes = await fetch(`${backendUrl}/api/referral/all`);
				const refs = await refRes.json();
				if (Array.isArray(refs)) {
					for (const r of refs) {
						try { await dbService.saveReferral(r); imported++; } catch {}
					}
				}
			} catch {}
			// Pull docs
			try {
				const docRes = await fetch(`${backendUrl}/api/doc/all`);
				const docs = await docRes.json();
				if (Array.isArray(docs)) {
					for (const d of docs) {
						try { await dbService.saveDoc(d); imported++; } catch {}
					}
				}
			} catch {}
			setSyncMessage(`✅ Pulled ${imported} records from cloud relay. Reloading...`);
			setRelayStatus('connected');
			setLastCloudSync(new Date().toLocaleString());
			setTimeout(() => window.location.reload(), 2000);
		} catch (err: any) {
			setSyncMessage(`❌ Pull failed: ${err.message}`);
			setRelayStatus('error');
		} finally {
			setCloudPulling(false);
			setTimeout(() => setSyncMessage(null), 5000);
		}
	};

	const handleSave = async () => {
		if (!settings) return;

		setLoading(true);

		try {
			console.log("🚀 SAVING SETTINGS:", settings);

			const res = await dbService.saveSettings(settings);

			// 🔥 IMMEDIATE REFETCH (CRITICAL)
			const fresh = await dbService.getSettings();
			setSettings({
				companyName: "",
				entityType: "",
				panNumber: "",
				licenseRegistrationNumber: "",
				urcNumber: "",
				tanNumber: "",
				adminId: "",
				adminPassword: "",
				autoSync: true,
				backupCycleStartYear: new Date().getFullYear(),
				lastBackupDate: "",
				gstNumber: "",
				companyEmail: "",
				companyWebsite: "",
				financialYearStart: "",
				financialYearEnd: "",
				companyLogo: "",
				companyWatermark: "",
				companyAddresses: [],
				managers: [],
				...fresh,
			});
			console.log("✅ SAVE RESPONSE:", res);
			window.dispatchEvent(new CustomEvent("settings-updated"));
			alert("Settings saved successfully!");
		} catch (e) {
			console.error("❌ SAVE ERROR:", e);
			alert("Failed to save settings.");
		} finally {
			setLoading(false);
		}
	};

	const [showBackupModal, setShowBackupModal] = useState(false);
	const [backupStep, setBackupStep] = useState<
		"INITIAL" | "BACKUP_DONE" | "RESET_AUTH"
	>("INITIAL");
	const [resetPassword, setResetPassword] = useState("");
	const [resetError, setResetError] = useState("");

	const [showSyncModal, setShowSyncModal] = useState(false);
	const [syncCodeInput, setSyncCodeInput] = useState("");
	const [syncMode, setSyncMode] = useState<"export" | "import">("export");
	const [syncPackage, setSyncPackage] = useState<string | null>(null);
	const [syncPackageData, setSyncPackageData] = useState<any>(null);
	const [generatedSyncCode, setGeneratedSyncCode] = useState<string | null>(null);
	const [syncCopied, setSyncCopied] = useState(false);
	const [syncLoading, setSyncLoading] = useState(false);
	const [syncMessage2, setSyncMessage2] = useState<string | null>(null);
	const [dragOver, setDragOver] = useState(false);

	const handleBackupAndReset = async () => {
		try {
			setLoading(true);
			// 1. Export Data
			const allData = await dbService.exportData();

			// 2. Trigger Download (Try modern "Save As", fallback to standard)
			const content = JSON.stringify(allData, null, 2);
			const fileName = `ashray_ledger_backup_${new Date().toISOString().split("T")[0]}.json`;
			let savedSuccessfully = false;

			if ("showSaveFilePicker" in window) {
				try {
					const handle = await (window as any).showSaveFilePicker({
						suggestedName: fileName,
						types: [
							{
								description: "JSON Backup File",
								accept: { "application/json": [".json"] },
							},
						],
					});
					const writable = await handle.createWritable();
					await writable.write(content);
					await writable.close();
					savedSuccessfully = true;
				} catch (err: any) {
					if (err.name === "AbortError") {
						setLoading(false);
						return; // User cancelled
					}
					console.warn(
						"Modern file picker blocked or failed, using fallback",
						err,
					);
				}
			}

			if (!savedSuccessfully) {
				const blob = new Blob([content], { type: "application/json" });
				const url = URL.createObjectURL(blob);
				const downloadAnchorNode = document.createElement("a");
				downloadAnchorNode.setAttribute("href", url);
				downloadAnchorNode.setAttribute("download", fileName);
				document.body.appendChild(downloadAnchorNode);
				downloadAnchorNode.click();
				downloadAnchorNode.remove();
				URL.revokeObjectURL(url);
			}

			// 3. Update Last Backup Date
			if (settings) {
				const updatedSettings = {
					...settings,
					lastBackupDate: new Date().toLocaleString(),
				};
				await dbService.saveSettings(updatedSettings);
				setSettings(updatedSettings);
			}

			setBackupStep("BACKUP_DONE");
		} catch (err) {
			console.error("Backup failed", err);
			alert("Failed to create backup.");
		} finally {
			setLoading(false);
		}
	};

	const handleResetLedger = async () => {
		if (!settings) return;

		if (resetPassword !== (settings.adminPassword || "ashray123")) {
			setResetError("Incorrect admin password. Please try again.");
			return;
		}

		try {
			setLoading(true);
			await dbService.resetLedger();

			// Reset cycle start year
			const newSettings = {
				...settings,
				backupCycleStartYear: new Date().getFullYear(),
				lastBackupDate: new Date().toLocaleString(),
			};
			await dbService.saveSettings(newSettings);

			alert("Ledger has been reset successfully. Starting new 10-year cycle.");
			window.location.reload();
		} catch (err) {
			console.error("Reset failed", err);
			alert("Failed to reset ledger.");
		} finally {
			setLoading(false);
		}
	};

	const handleExportSyncPackage = async () => {
		setSyncLoading(true);
		setSyncMessage2(null);
		try {
			const pkg = await dbService.exportSyncPackage();
			const parsed = JSON.parse(pkg);

			// Generate a sync code that is a signature of the data itself
			const dataStr = JSON.stringify(parsed.data || parsed);
			let hash = 0;
			for (let i = 0; i < dataStr.length; i++) {
				const char = dataStr.charCodeAt(i);
				hash = ((hash << 5) - hash) + char;
				hash = hash & hash;
			}
			const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
			let code = '';
			const absHash = Math.abs(hash);
			for (let i = 0; i < 8; i++) {
				code += chars.charAt((absHash >> (i * 3)) % chars.length);
			}

			parsed.generatedSyncCode = code;
			parsed.sourceMachineId = installation?.machineId || '';
			setSyncPackage(JSON.stringify(parsed, null, 2));
			setGeneratedSyncCode(code);
			setSyncMessage2(`✅ Package ready! Share code "${code}" and the file with the new device.`);
		} catch (err: any) {
			setSyncMessage2(`Export failed: ${err.message}`);
		} finally {
			setSyncLoading(false);
		}
	};

	const handleCopySyncCode = () => {
		if (syncPackage) {
			navigator.clipboard?.writeText(syncPackage).then(() => {
				setSyncCopied(true);
				setTimeout(() => setSyncCopied(false), 2000);
			});
		}
	};

	const handleDownloadSyncPackage = () => {
		if (!syncPackage) return;
		const blob = new Blob([syncPackage], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `ashray_sync_${new Date().toISOString().split("T")[0]}.json`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	const handleImportFromFile = (file: File) => {
		setSyncLoading(true);
		setSyncMessage2(null);
		const reader = new FileReader();
		reader.onload = async (e) => {
			try {
				const content = e.target?.result as string;
				const data = JSON.parse(content);
				// Verify the sync code matches the data
				if (data.generatedSyncCode && syncCodeInput) {
					const dataStr = JSON.stringify(data.data || data);
					let hash = 0;
					for (let i = 0; i < dataStr.length; i++) {
						const char = dataStr.charCodeAt(i);
						hash = ((hash << 5) - hash) + char;
						hash = hash & hash;
					}
					const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
					let expectedCode = '';
					const absHash = Math.abs(hash);
					for (let i = 0; i < 8; i++) {
						expectedCode += chars.charAt((absHash >> (i * 3)) % chars.length);
					}
					if (syncCodeInput !== expectedCode) {
						setSyncMessage2(`❌ Sync code mismatch! The code "${syncCodeInput}" does not match this data package. Use the code shown when you generated this package.`);
						setSyncLoading(false);
						return;
					}
				} else if (data.generatedSyncCode && !syncCodeInput) {
					setSyncMessage2(`⚠️ Enter the sync code for this package (shown when it was generated)`);
					setSyncLoading(false);
					return;
				}
				await handleImportData(data.data || data);
			} catch (err: any) {
				setSyncMessage2(`Import failed: ${err.message}`);
			} finally {
				setSyncLoading(false);
			}
		};
		reader.onerror = () => {
			setSyncMessage2("Failed to read file");
			setSyncLoading(false);
		};
		reader.readAsText(file);
	};

	const handleImportFromClipboard = async () => {
		try {
			const text = await navigator.clipboard?.readText();
			if (!text) {
				setSyncMessage2("Clipboard is empty");
				return;
			}
			setSyncLoading(true);
			setSyncMessage2(null);
			const data = JSON.parse(text);
			// Verify code if package has one
			if (data.generatedSyncCode) {
				if (!syncCodeInput) {
					setSyncMessage2(`⚠️ Enter the sync code for this package first`);
					setSyncLoading(false);
					return;
				}
				const dataStr = JSON.stringify(data.data || data);
				let hash = 0;
				for (let i = 0; i < dataStr.length; i++) {
					const char = dataStr.charCodeAt(i);
					hash = ((hash << 5) - hash) + char;
					hash = hash & hash;
				}
				const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
				let expectedCode = '';
				const absHash = Math.abs(hash);
				for (let i = 0; i < 8; i++) {
					expectedCode += chars.charAt((absHash >> (i * 3)) % chars.length);
				}
				if (syncCodeInput !== expectedCode) {
					setSyncMessage2(`❌ Code mismatch! The code does not match this package.`);
					setSyncLoading(false);
					return;
				}
			}
			await handleImportData(data.data || data);
		} catch (err: any) {
			setSyncMessage2(`Import failed: ${err.message}`);
		} finally {
			setSyncLoading(false);
		}
	};

	const handleImportFromSyncCode = async () => {
		if (!syncCodeInput.trim()) {
			setSyncMessage2("Please enter a sync code");
			return;
		}
		setSyncLoading(true);
		setSyncMessage2(null);
		try {
			// Attempt LAN sync with the entered code
			const result = await dbService.importSyncPackage(syncCodeInput.trim());
			setSyncMessage2("Sync completed successfully via LAN");
		} catch (err: any) {
			setSyncMessage2(`Sync failed: ${err.message}. Try file import instead.`);
		} finally {
			setSyncLoading(false);
		}
	};

	const handleImportData = async (data: any) => {
		let imported = 0;

		if (data.clients && Array.isArray(data.clients)) {
			for (const client of data.clients) {
				try { await dbService.saveClient(client); imported++; } catch {}
			}
		}
		if (data.transactions && Array.isArray(data.transactions)) {
			for (const tx of data.transactions) {
				try { await dbService.saveTransaction(tx); imported++; } catch {}
			}
		}
		if (data.properties && Array.isArray(data.properties)) {
			for (const prop of data.properties) {
				try { await dbService.saveProperty(prop); imported++; } catch {}
			}
		}
		if (data.kissans && Array.isArray(data.kissans)) {
			for (const kissan of data.kissans) {
				try { await dbService.saveKissan(kissan); imported++; } catch {}
			}
		}
		if (data.investors && Array.isArray(data.investors)) {
			for (const inv of data.investors) {
				try { await dbService.saveInvestor(inv); imported++; } catch {}
			}
		}
		if (data.loans && Array.isArray(data.loans)) {
			for (const loan of data.loans) {
				try { await dbService.saveLoan(loan); imported++; } catch {}
			}
		}
		if (data.banks && Array.isArray(data.banks)) {
			for (const bank of data.banks) {
				try { await dbService.saveBank(bank); imported++; } catch {}
			}
		}
		if (data.staff && Array.isArray(data.staff)) {
			for (const s of data.staff) {
				try { await dbService.saveStaff(s); imported++; } catch {}
			}
		}
		if (data.docs && Array.isArray(data.docs)) {
			for (const doc of data.docs) {
				try { await dbService.saveDoc(doc); imported++; } catch {}
			}
		}
		if (data.gstEntries && Array.isArray(data.gstEntries)) {
			for (const gst of data.gstEntries) {
				try { await dbService.saveGstEntry(gst); imported++; } catch {}
			}
		}
		if (data.pendingReceipts && Array.isArray(data.pendingReceipts)) {
			for (const r of data.pendingReceipts) {
				try { await dbService.savePendingReceipt(r); imported++; } catch {}
			}
		}
		if (data.settings && Object.keys(data.settings).length > 0) {
			try { await dbService.saveSettings(data.settings); imported++; } catch {}
		}

		setSyncMessage2(`✅ Imported ${imported} records with all documents & photos. Reloading...`);
		setTimeout(() => window.location.reload(), 2000);
	};

	const handleChange = (field: keyof AppSettings, value: any) => {
		if (settings) {
			setSettings({ ...settings, [field]: value });
		}
	};

	const handleImageUpload = (
		e: React.ChangeEvent<HTMLInputElement>,
		field: "companyLogo" | "companyWatermark",
	) => {
		const file = e.target.files?.[0];
		if (file) {
			if (file.size > 2 * 1024 * 1024) {
				alert("Image should be less than 2MB");
				return;
			}
			const reader = new FileReader();
			reader.onloadend = () => {
				handleChange(field, reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	if (!settings) return <div>Loading...</div>;

	return (
		<div className="max-w-3xl mx-auto space-y-6 pb-20">
			{/* Backup & Reset Modal */}
			{showBackupModal && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
					<div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
						<div className="p-6 border-b border-slate-100 bg-orange-50">
							<h3 className="text-xl font-bold text-orange-800">
								Backup & Reset Ledger
							</h3>
							<p className="text-sm text-orange-600 mt-1">
								Follow the steps to secure your data.
							</p>
						</div>

						<div className="p-6 space-y-6">
							{backupStep === "INITIAL" && (
								<div className="space-y-4">
									<div className="flex items-center space-x-3 text-slate-700">
										<div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
											1
										</div>
										<p className="font-medium">Download Full Backup</p>
									</div>
									<p className="text-sm text-slate-500 ml-11">
										This will export all your clients, transactions, properties,
										and records into a single JSON file. Save this file in a
										safe location (External Drive or Cloud).
									</p>
									<button
										onClick={handleBackupAndReset}
										disabled={loading}
										className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 transition-colors shadow-lg disabled:opacity-50"
									>
										{loading ? "Generating Backup..." : "Download Backup File"}
									</button>
								</div>
							)}

							{backupStep === "BACKUP_DONE" && (
								<div className="space-y-4">
									<div className="flex items-center space-x-3 text-green-700">
										<div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold">
											✓
										</div>
										<p className="font-medium">Backup Completed</p>
									</div>
									<p className="text-sm text-slate-500 ml-11">
										Your backup file has been downloaded. Are you ready to reset
										the ledger for a new cycle?
									</p>
									<div className="flex gap-3">
										<button
											onClick={() => setShowBackupModal(false)}
											className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors"
										>
											Close
										</button>
										<button
											onClick={() => setBackupStep("RESET_AUTH")}
											className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg"
										>
											Proceed to Reset
										</button>
									</div>
								</div>
							)}

							{backupStep === "RESET_AUTH" && (
								<div className="space-y-4">
									<div className="flex items-center space-x-3 text-red-700">
										<div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold">
											!
										</div>
										<p className="font-medium">Verify Identity to Reset</p>
									</div>
									<p className="text-sm text-slate-500 ml-11">
										Enter your admin password to confirm the full reset of the
										ledger. This action cannot be undone.
									</p>

									<div className="ml-11 space-y-2">
										<input
											type="password"
											placeholder="Enter Admin Password"
											value={resetPassword}
											onChange={(e) => {
												setResetPassword(e.target.value);
												setResetError("");
											}}
											className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none"
										/>
										{resetError && (
											<p className="text-xs text-red-600 font-medium">
												{resetError}
											</p>
										)}
									</div>

									<div className="flex gap-3">
										<button
											onClick={() => setBackupStep("BACKUP_DONE")}
											className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors"
										>
											Back
										</button>
										<button
											onClick={handleResetLedger}
											disabled={loading}
											className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg disabled:opacity-50"
										>
											{loading ? "Resetting..." : "Confirm Reset"}
										</button>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			)}
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold text-slate-800">Settings</h1>
				{isEditing ? (
					<div className="flex gap-2">
						<button
							onClick={() => {
								setSettings(originalSettings);
								setIsEditing(false);
							}}
							className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors"
						>
							Cancel
						</button>
						<button
							onClick={async () => {
								await handleSave();
								setIsEditing(false);
							}}
							className="flex items-center bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 font-medium text-sm transition-colors shadow-sm"
							disabled={loading}
						>
							<Save size={16} className="mr-2" />
							{loading ? "Saving..." : "Save Changes"}
						</button>
					</div>
				) : (
					<button
						onClick={() => {
							setOriginalSettings(settings);
							setIsEditing(true);
						}}
						className="flex items-center bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-medium text-sm transition-colors shadow-sm"
					>
						Edit/Manage
					</button>
				)}
			</div>

			{/* Set Financial Year */}
			<div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
				<div className="p-6 border-b border-slate-100 bg-red-50/50">
					<div className="flex items-center space-x-2">
						<Calendar className="text-red-600" size={24} />
						<h2 className="text-lg font-medium text-slate-800">
							Set Financial Year
						</h2>
					</div>
					<p className="text-sm text-slate-500 mt-1">
						Define the start and end dates for your business financial year.
					</p>
				</div>
				<div className="p-6 space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label className="block text-sm font-medium text-slate-700 mb-1">
								Financial Year Start
							</label>
							{isEditing ? (
								<input
									type="date"
									value={settings.financialYearStart || ""}
									onChange={(e) =>
										handleChange("financialYearStart", e.target.value)
									}
									className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
								/>
							) : (
								<p className="w-full border border-transparent rounded-lg px-3 py-2 bg-slate-50 text-slate-900 font-medium">
									{settings.financialYearStart || "-"}
								</p>
							)}
						</div>
						<div>
							<label className="block text-sm font-medium text-slate-700 mb-1">
								Financial Year End
							</label>
							{isEditing ? (
								<input
									type="date"
									value={settings.financialYearEnd || ""}
									onChange={(e) =>
										handleChange("financialYearEnd", e.target.value)
									}
									className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
								/>
							) : (
								<p className="w-full border border-transparent rounded-lg px-3 py-2 bg-slate-50 text-slate-900 font-medium">
									{settings.financialYearEnd || "-"}
								</p>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* General Settings */}
			<div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
				<div className="p-6 border-b border-slate-100 bg-red-50/50">
					<div className="flex items-center space-x-2">
						<Building2 className="text-red-600" size={24} />
						<h2 className="text-lg font-medium text-slate-800">
							Company Profile
						</h2>
					</div>
					<p className="text-sm text-slate-500 mt-1">
						Manage your business details used on receipts.
					</p>
				</div>
				<div className="p-6 space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label className="block text-sm font-medium text-slate-700 mb-1">
								Company Name
							</label>
							{isEditing ? (
								<input
									type="text"
									value={settings.companyName}
									onChange={(e) => handleChange("companyName", e.target.value)}
									className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
								/>
							) : (
								<p className="w-full border border-transparent rounded-lg px-3 py-2 bg-slate-50 text-slate-900 font-medium">
									{settings.companyName || "-"}
								</p>
							)}
						</div>
						<div>
							<label className="block text-sm font-medium text-slate-700 mb-1">
								Entity Type
							</label>
							{isEditing ? (
								<div className="space-y-2">
									<select
										value={
											isOtherSelected ? "Other" : settings.entityType || ""
										}
										onChange={(e) => {
											const val = e.target.value;
											if (val === "Other") {
												setIsOtherSelected(true);
												handleChange("entityType", "");
											} else {
												setIsOtherSelected(false);
												handleChange("entityType", val);
											}
										}}
										className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
									>
										<option value="">-- Select Entity Type --</option>
										<option value="Sole Proprietorship (S.P.)">
											Sole Proprietorship (S.P.)
										</option>
										<option value="Private Limited Company (Pvt. Ltd.)">
											Private Limited Company (Pvt. Ltd.)
										</option>
										<option value="Public Limited Company (Ltd.)">
											Public Limited Company (Ltd.)
										</option>
										<option value="Partnership Firm (P.F.)">
											Partnership Firm (P.F.)
										</option>
										<option value="Limited Liability Partnership (LLP)">
											Limited Liability Partnership (LLP)
										</option>
										<option value="Other">Other (Custom)</option>
									</select>

									{isOtherSelected && (
										<input
											type="text"
											placeholder="Enter Custom Entity Type"
											value={settings.entityType || ""}
											onChange={(e) =>
												handleChange("entityType", e.target.value)
											}
											className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
										/>
									)}
								</div>
							) : (
								<p className="w-full border border-transparent rounded-lg px-3 py-2 bg-slate-50 text-slate-900 font-medium">
									{settings.entityType || "-"}
								</p>
							)}
						</div>
						<div>
							<label className="block text-sm font-medium text-slate-700 mb-1">
								Company logo
							</label>
							{isEditing ? (
								<div className="flex items-center space-x-4">
									<div className="flex-shrink-0 w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200 overflow-hidden">
										{settings.companyLogo ? (
											<img
												src={settings.companyLogo}
												alt="Logo"
												className="w-full h-full object-contain"
											/>
										) : (
											<Image className="text-slate-400" size={24} />
										)}
									</div>
									<label className="flex items-center space-x-2 bg-white border border-slate-300 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors shadow-sm">
										<Upload size={16} />
										<span>Upload Logo</span>
										<input
											type="file"
											accept="image/*"
											className="hidden"
											onChange={(e) => handleImageUpload(e, "companyLogo")}
										/>
									</label>
								</div>
							) : (
								<div className="w-16 h-16 bg-slate-50 rounded-lg flex items-center justify-center border border-transparent overflow-hidden">
									{settings.companyLogo ? (
										<img
											src={settings.companyLogo}
											alt="Logo"
											className="w-full h-full object-contain"
										/>
									) : (
										<p className="text-xs text-slate-400">None</p>
									)}
								</div>
							)}
						</div>
						<div>
							<label className="block text-sm font-medium text-slate-700 mb-1">
								Company watermark
							</label>
							{isEditing ? (
								<div className="flex items-center space-x-4">
									<div className="flex-shrink-0 w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200 overflow-hidden">
										{settings.companyWatermark ? (
											<img
												src={settings.companyWatermark}
												alt="Watermark"
												className="w-full h-full object-contain"
											/>
										) : (
											<Image className="text-slate-400" size={24} />
										)}
									</div>
									<label className="flex items-center space-x-2 bg-white border border-slate-300 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors shadow-sm">
										<Upload size={16} />
										<span>Upload Watermark</span>
										<input
											type="file"
											accept="image/*"
											className="hidden"
											onChange={(e) => handleImageUpload(e, "companyWatermark")}
										/>
									</label>
								</div>
							) : (
								<div className="w-16 h-16 bg-slate-50 rounded-lg flex items-center justify-center border border-transparent overflow-hidden">
									{settings.companyWatermark ? (
										<img
											src={settings.companyWatermark}
											alt="Watermark"
											className="w-full h-full object-contain"
										/>
									) : (
										<p className="text-xs text-slate-400">None</p>
									)}
								</div>
							)}
						</div>
						<div>
							<label className="block text-sm font-medium text-slate-700 mb-1">
								PAN Number
							</label>
							{isEditing ? (
								<input
									type="text"
									value={settings.panNumber || ""}
									onChange={(e) => handleChange("panNumber", e.target.value)}
									className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
								/>
							) : (
								<p className="w-full border border-transparent rounded-lg px-3 py-2 bg-slate-50 text-slate-900 font-medium">
									{settings.panNumber || "-"}
								</p>
							)}
						</div>
						<div>
							<label className="block text-sm font-medium text-slate-700 mb-1">
								License Registration Number
							</label>
							{isEditing ? (
								<input
									type="text"
									value={settings.licenseRegistrationNumber || ""}
									onChange={(e) =>
										handleChange("licenseRegistrationNumber", e.target.value)
									}
									className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
								/>
							) : (
								<p className="w-full border border-transparent rounded-lg px-3 py-2 bg-slate-50 text-slate-900 font-medium">
									{settings.licenseRegistrationNumber || "-"}
								</p>
							)}
						</div>
						<div>
							<label className="block text-sm font-medium text-slate-700 mb-1">
								URC No.
							</label>
							{isEditing ? (
								<input
									type="text"
									value={settings.urcNumber || ""}
									onChange={(e) => handleChange("urcNumber", e.target.value)}
									className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
								/>
							) : (
								<p className="w-full border border-transparent rounded-lg px-3 py-2 bg-slate-50 text-slate-900 font-medium">
									{settings.urcNumber || "-"}
								</p>
							)}
						</div>
						<div>
							<label className="block text-sm font-medium text-slate-700 mb-1">
								TAN Number
							</label>
							{isEditing ? (
								<input
									type="text"
									value={settings.tanNumber || ""}
									onChange={(e) => handleChange("tanNumber", e.target.value)}
									className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
								/>
							) : (
								<p className="w-full border border-transparent rounded-lg px-3 py-2 bg-slate-50 text-slate-900 font-medium">
									{settings.tanNumber || "-"}
								</p>
							)}
						</div>
						<div>
							<label className="block text-sm font-medium text-slate-700 mb-1">
								GST Number
							</label>
							{isEditing ? (
								<input
									type="text"
									placeholder="GST Number"
									value={settings?.gstNumber || ""}
									onChange={(e) =>
										setSettings({ ...settings, gstNumber: e.target.value })
									}
									className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
								/>
							) : (
								<p className="w-full border border-transparent rounded-lg px-3 py-2 bg-slate-50 text-slate-900 font-medium">
									{settings?.gstNumber || "-"}
								</p>
							)}
						</div>
						<div>
							<label className="block text-sm font-medium text-slate-700 mb-1">
								Company Email ID
							</label>
							{isEditing ? (
								<input
									type="email"
									placeholder="Company Email ID"
									value={settings?.companyEmail || ""}
									onChange={(e) => handleChange("companyEmail", e.target.value)}
									className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
								/>
							) : (
								<p className="w-full border border-transparent rounded-lg px-3 py-2 bg-slate-50 text-slate-900 font-medium">
									{settings?.companyEmail || "-"}
								</p>
							)}
						</div>
						<div>
							<label className="block text-sm font-medium text-slate-700 mb-1">
								Company Website
							</label>
							{isEditing ? (
								<input
									type="text"
									placeholder="Company Website"
									value={settings?.companyWebsite || ""}
									onChange={(e) =>
										handleChange("companyWebsite", e.target.value)
									}
									className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
								/>
							) : (
								<p className="w-full border border-transparent rounded-lg px-3 py-2 bg-slate-50 text-slate-900 font-medium">
									{settings?.companyWebsite || "-"}
								</p>
							)}
						</div>
					</div>

					{/* Company Managers */}
					<div className="pt-6 border-t border-slate-100">
						<h3 className="text-md font-medium text-slate-800 mb-4">
							Company Managers
						</h3>
						<div className="space-y-3 mb-4">
							{(settings.managers || []).map((manager) => (
								<div
									key={manager.id}
									className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200"
								>
									<div>
										<p className="font-medium text-sm text-slate-800">
											{manager.name}
										</p>
										<p className="text-xs text-slate-500">
											{manager.role} • {manager.countryCode} {manager.phone}
										</p>
										{manager.address && (
											<p className="text-[10px] text-slate-400 mt-0.5">
												{manager.address}
											</p>
										)}
										{(manager.pan || manager.aadhaar) && (
											<p className="text-[10px] text-slate-400">
												{manager.pan && `PAN: ${manager.pan}`}{" "}
												{manager.aadhaar && `AADHAAR: ${manager.aadhaar}`}
											</p>
										)}
									</div>
									{isEditing && (
										<button
											onClick={() =>
												setSettings({
													...settings,
													managers: (settings.managers || []).filter(
														(m) => m.id !== manager.id,
													),
												})
											}
											className="text-red-500 hover:text-red-700 p-1"
										>
											<Trash2 size={16} />
										</button>
									)}
								</div>
							))}
							{(settings.managers || []).length === 0 && (
								<p className="text-sm text-slate-400 italic">
									No managers added yet.
								</p>
							)}
						</div>

						{isEditing && (
							<div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
									<input
										type="text"
										placeholder="Manager Name"
										value={newManager.name}
										onChange={(e) =>
											setNewManager({ ...newManager, name: e.target.value })
										}
										className="border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900 text-sm"
									/>
									<input
										type="text"
										placeholder="Role (e.g. Sales Manager)"
										value={newManager.role}
										onChange={(e) =>
											setNewManager({ ...newManager, role: e.target.value })
										}
										className="border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900 text-sm"
									/>
								</div>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
									<input
										type="text"
										placeholder="Manager Address"
										value={newManager.address}
										onChange={(e) =>
											setNewManager({ ...newManager, address: e.target.value })
										}
										className="border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900 text-sm"
									/>
									<input
										type="text"
										placeholder="Manager PAN"
										value={newManager.pan}
										onChange={(e) =>
											setNewManager({ ...newManager, pan: e.target.value })
										}
										className="border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900 text-sm"
									/>
									<input
										type="text"
										placeholder="Manager Aadhaar"
										value={newManager.aadhaar}
										onChange={(e) =>
											setNewManager({ ...newManager, aadhaar: e.target.value })
										}
										className="border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900 text-sm"
									/>
								</div>
								<div className="flex gap-2">
									<select
										value={newManager.countryCode}
										onChange={(e) =>
											setNewManager({
												...newManager,
												countryCode: e.target.value,
											})
										}
										className="border border-slate-300 rounded-lg px-2 py-2 bg-white text-slate-900 text-sm"
									>
										<option value="+91">+91 (India)</option>
										<option value="+1">+1 (USA)</option>
										<option value="+44">+44 (UK)</option>
										<option value="+971">+971 (UAE)</option>
										<option value="+61">+61 (Australia)</option>
										<option value="+81">+81 (Japan)</option>
										<option value="+49">+49 (Germany)</option>
										<option value="+33">+33 (France)</option>
										<option value="+86">+86 (China)</option>
										<option value="+92">+92 (Pakistan)</option>
										<option value="+880">+880 (Bangladesh)</option>
										<option value="+94">+94 (Sri Lanka)</option>
										<option value="+977">+977 (Nepal)</option>
										<option value="+7">+7 (Russia)</option>
										<option value="+39">+39 (Italy)</option>
									</select>
									<input
										type="text"
										placeholder="Phone Number"
										value={newManager.phone}
										onChange={(e) =>
											setNewManager({ ...newManager, phone: e.target.value })
										}
										className="flex-1 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900 text-sm"
									/>
								</div>
								<button
									onClick={() => {
										if (
											settings &&
											newManager.name &&
											newManager.role &&
											newManager.phone
										) {
											setSettings({
												...settings,
												managers: [
													...(settings.managers || []),
													{ id: Date.now().toString(), ...newManager },
												],
											});
											setNewManager({
												name: "",
												role: "",
												phone: "",
												countryCode: "+91",
												address: "",
												pan: "",
												aadhaar: "",
											});
										}
									}}
									className="w-full bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 font-medium text-sm transition-colors flex items-center justify-center"
								>
									<Plus size={16} className="mr-2" />
									Add Manager
								</button>
							</div>
						)}
					</div>

					{/* Company Addresses */}
					<div>
						<label className="block text-sm font-medium text-slate-700 mb-2">
							Company Addresses
						</label>
						<div className="space-y-2 mb-4">
							{(settings.companyAddresses || []).map((addr) => (
								<div
									key={addr.id}
									className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200"
								>
									<div>
										<p className="font-medium text-sm text-slate-800">
											{addr.name}
										</p>
										<p className="text-xs text-slate-500">
											{addr.addressLine}, {addr.locality}, {addr.district},{" "}
											{addr.state} - {addr.pinCode}
										</p>
									</div>
									{isEditing && (
										<button
											onClick={() =>
												setSettings({
													...settings,
													companyAddresses: (
														settings.companyAddresses || []
													).filter((a) => a.id !== addr.id),
												})
											}
											className="text-red-500 hover:text-red-700"
										>
											<Trash2 size={16} />
										</button>
									)}
								</div>
							))}
						</div>
						{isEditing && (
							<div className="space-y-3">
								<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
									<select
										value={newCompanyAddress.name}
										onChange={(e) =>
											setNewCompanyAddress({
												...newCompanyAddress,
												name: e.target.value,
											})
										}
										className="border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
									>
										<option value="">-- Select Address Type --</option>
										<option value="Registered Office">Registered Office</option>
										<option value="Head Office">Head Office</option>
										<option value="Branch Office">Branch Office</option>
									</select>

									<input
										type="text"
										placeholder="Address Line"
										value={newCompanyAddress.addressLine}
										onChange={(e) =>
											setNewCompanyAddress({
												...newCompanyAddress,
												addressLine: e.target.value,
											})
										}
										className="border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
									/>

									<input
										type="text"
										placeholder="Locality"
										value={newCompanyAddress.locality}
										onChange={(e) =>
											setNewCompanyAddress({
												...newCompanyAddress,
												locality: e.target.value,
											})
										}
										className="border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
									/>

									<input
										type="text"
										placeholder="District"
										value={newCompanyAddress.district}
										onChange={(e) =>
											setNewCompanyAddress({
												...newCompanyAddress,
												district: e.target.value,
											})
										}
										className="border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
									/>

									<input
										type="text"
										placeholder="State"
										value={newCompanyAddress.state}
										onChange={(e) =>
											setNewCompanyAddress({
												...newCompanyAddress,
												state: e.target.value,
											})
										}
										className="border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
									/>

									<input
										type="text"
										placeholder="Pin Code"
										value={newCompanyAddress.pinCode}
										onChange={(e) =>
											setNewCompanyAddress({
												...newCompanyAddress,
												pinCode: e.target.value,
											})
										}
										className="border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
									/>
								</div>
								<button
									onClick={() => {
										if (
											settings &&
											newCompanyAddress.name &&
											newCompanyAddress.addressLine &&
											newCompanyAddress.district &&
											newCompanyAddress.state &&
											newCompanyAddress.pinCode
										) {
											setSettings({
												...settings,
												companyAddresses: [
													...(settings.companyAddresses || []),
													{ id: Date.now().toString(), ...newCompanyAddress },
												],
											});
											setNewCompanyAddress({
												name: "",
												addressLine: "",
												locality: "",
												district: "",
												state: "",
												pinCode: "",
											});
										}
									}}
									className="w-full bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 font-medium text-sm transition-colors flex items-center justify-center"
								>
									<Plus size={16} className="mr-2" />
									Add Company Address
								</button>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Security & Login Settings */}
			<div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
				<div className="p-6 border-b border-slate-100 bg-red-50/50">
					<div className="flex items-center space-x-2">
						<Lock className="text-red-600" size={24} />
						<h2 className="text-lg font-medium text-slate-800">
							Security & Login
						</h2>
					</div>
					<p className="text-sm text-slate-500 mt-1">
						Manage your administrative credentials and registered phone number.
					</p>
				</div>
				<div className="p-6 space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label className="block text-sm font-medium text-slate-700 mb-1">
								Admin Login ID
							</label>
							{isEditing ? (
								<input
									type="text"
									value={settings.adminId || ""}
									onChange={(e) => handleChange("adminId", e.target.value)}
									className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
								/>
							) : (
								<p className="w-full border border-transparent rounded-lg px-3 py-2 bg-slate-50 text-slate-900 font-medium">
									{settings.adminId || "-"}
								</p>
							)}
						</div>
						<div>
							<label className="block text-sm font-medium text-slate-700 mb-1">
								Admin Password
							</label>
							{isEditing ? (
								<input
									type="password"
									value={settings.adminPassword || ""}
									onChange={(e) =>
										handleChange("adminPassword", e.target.value)
									}
									className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
								/>
							) : (
								<p className="w-full border border-transparent rounded-lg px-3 py-2 bg-slate-50 text-slate-900 font-medium">
									••••••••
								</p>
							)}
						</div>
					</div>
				</div>
			</div>

			<div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
				<div className="p-6 border-b border-slate-100 bg-red-50/50">
					<div className="flex items-center space-x-2">
						<div className="flex items-center space-x-2">
							<RefreshCw className="text-red-600" size={24} />
							<h2 className="text-lg font-medium text-slate-800">
								Data & Sync
							</h2>
						</div>
					</div>

					<div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
						<div>
							<p className="font-bold text-slate-800">Auto-Sync Feature</p>
							<p className="text-sm text-slate-500">
								Keep your data instantly synced with the Ashray backend
							</p>
						</div>
						<div
							onClick={() =>
								isEditing && handleChange("autoSync", !settings.autoSync)
							}
							className={`relative inline-block w-14 h-7 transition duration-200 ease-in-out rounded-full ${isEditing ? "cursor-pointer" : "cursor-default"} ${settings.autoSync ? "bg-emerald-500" : "bg-slate-300"}`}
						>
							<span
								className={`absolute top-0.5 left-0.5 inline-block w-6 h-6 bg-white rounded-full shadow-lg transform transition-transform duration-200 ease-in-out ${settings.autoSync ? "translate-x-7" : "translate-x-0"}`}
							></span>
						</div>
					</div>

					<div className="flex flex-col sm:flex-row gap-3">
						<button
							onClick={handleWebsiteSync}
							disabled={websiteSyncing}
							className="w-full flex items-center justify-center bg-white border border-slate-200 text-slate-700 px-4 py-3 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all disabled:opacity-50"
						>
							<RefreshCw
								size={18}
								className={`mr-2 text-emerald-600 ${websiteSyncing ? "animate-spin" : ""}`}
							/>
							{websiteSyncing ? "Syncing..." : "Sync with Website"}
						</button>
					</div>

					{syncMessage && (
						<div
							className={`p-4 rounded-xl text-sm font-bold flex items-center shadow-sm border ${syncMessage.includes("Successfully") || !syncMessage.includes("failed") ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-100"}`}
						>
							{syncMessage.includes("Successfully") ? (
								<Save size={18} className="mr-2" />
							) : (
								<RefreshCw size={18} className="mr-2" />
							)}
							{syncMessage}
						</div>
					)}
								</div>
			</div>
		

			<div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
				<div className="p-6 border-b border-slate-100 bg-red-50/50">
					<div className="flex items-center space-x-2">
						<div className="flex items-center space-x-2">
							<Save className="text-red-600" size={24} />
							<h2 className="text-lg font-medium text-slate-800">
								Backup & Reset (10-Year Cycle)
							</h2>
						</div>
					</div>
					<p className="text-sm text-slate-500 mt-1">
						The ledger follows a 10-year cycle. Every 10 years, take a backup and reset.
					</p>
				</div>
				<div className="p-6 space-y-6">

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
							<div>
								<label className="block text-sm font-medium text-slate-700 mb-1">
									Cycle Start Year
								</label>
								{isEditing ? (
									<input
										type="number"
										value={
											settings.backupCycleStartYear || new Date().getFullYear()
										}
										onChange={(e) =>
											handleChange(
												"backupCycleStartYear",
												parseInt(e.target.value),
											)
										}
										className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
									/>
								) : (
									<p className="w-full border border-transparent rounded-lg px-3 py-2 bg-slate-50 text-slate-900 font-medium">
										{settings.backupCycleStartYear || new Date().getFullYear()}
									</p>
								)}
							</div>
							<div>
								<label className="block text-sm font-medium text-slate-700 mb-1">
									Last Backup Date
								</label>
								<input
									type="text"
									readOnly
									value={settings.lastBackupDate || "Never"}
									className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 text-slate-500 outline-none"
								/>
							</div>
						</div>

						<div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-4 flex items-center">
							<div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
								<Calendar className="text-orange-600" size={20} />
							</div>
							<p className="text-sm text-orange-800">
								<strong>Current History Status:</strong> You are in{" "}
								<strong>
									Year{" "}
									{new Date().getFullYear() -
										(settings.backupCycleStartYear ||
											new Date().getFullYear()) +
										1}
								</strong>{" "}
								of the 10-year cycle.
							</p>
						</div>

						<button
							onClick={() => {
								setBackupStep("INITIAL");
								setShowBackupModal(true);
							}}
							className="w-full sm:w-auto bg-orange-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-orange-700 transition-all shadow-md flex items-center justify-center hover:shadow-lg active:scale-95"
						>
							<Save size={18} className="mr-2" />
							Take Backup & Reset Ledger
						</button>
</div>
			</div>

			{/* Office Sync Settings */}
			<div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden mt-10">
				<div className="p-8 border-b border-slate-100 bg-slate-50/50">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
								<Radio className="text-blue-600" size={24} />
							</div>
							<div>
								<h2 className="text-xl font-bold text-slate-800">Office LAN Sync</h2>
								<p className="text-sm text-slate-500">Manage real-time synchronization between office machines.</p>
							</div>
						</div>
						{installation && (
							<div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${installation.mode === 'Independent' ? 'bg-slate-100 text-slate-600' : 'bg-green-100 text-green-700'}`}>
								{installation.mode} MODE
							</div>
						)}
					</div>
				</div>

				<div className="p-8">
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
						<div className="lg:col-span-1 space-y-6">
							<div>
								<label className="text-xs font-bold text-slate-400 uppercase mb-2 block tracking-tight">Sync Authorization Code</label>
								<div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
									<code className="text-2xl font-mono font-bold text-blue-600 uppercase tracking-widest flex-1">
										{installation?.syncCode || '--------'}
									</code>
								</div>
								<p className="text-[10px] text-slate-400 mt-2 font-medium">Use this code on other machines to connect to this ledger.</p>
							</div>

							<div>
								<label className="text-xs font-bold text-slate-400 uppercase mb-2 block tracking-tight">Local Machine Registry</label>
								<div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
									<div className="flex items-center justify-between">
										<span className="text-xs text-slate-500">Machine ID</span>
										<span className="text-xs font-mono font-bold text-slate-800">{installation?.machineId}</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-xs text-slate-500">Ledger ID</span>
										<span className="text-xs font-mono font-bold text-slate-800">{installation?.ledgerId || 'Linked'}</span>
									</div>
								</div>
							</div>
						</div>

						<div className="lg:col-span-2">
							<div className="flex items-center justify-between mb-4">
								<h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
									<Monitor size={16} /> Connected Devices ({machines.length})
								</h3>
								<button
									onClick={() => {
										setSyncMode("export");
										setSyncPackage(null);
										setSyncMessage2(null);
										setShowSyncModal(true);
									}}
									className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-md flex items-center gap-1.5"
								>
									<Plus size={14} /> Add Device
								</button>
							</div>
							<div className="overflow-hidden rounded-2xl border border-slate-100">
								<table className="w-full text-left">
									<thead className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
										<tr>
											<th className="px-6 py-3">Machine Name</th>
											<th className="px-6 py-3">Device info</th>
											<th className="px-6 py-3 text-right">Last Seen</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-slate-50 text-sm">
										{machines.length === 0 ? (
											<tr>
												<td colSpan={3} className="px-6 py-10 text-center text-slate-400 italic font-medium">No other machines connected yet.</td>
											</tr>
										) : (
											machines.map((m) => (
												<tr key={m.machineId} className="hover:bg-slate-50/50 transition-colors">
													<td className="px-6 py-4 font-bold text-slate-800">{m.name}</td>
													<td className="px-6 py-4 text-slate-500 flex items-center gap-2 uppercase text-xs font-bold tracking-tighter">
														<Cpu size={14} className="text-slate-400" /> {m.deviceType}
													</td>
													<td className="px-6 py-4 text-slate-500 text-right text-xs font-medium">{m.lastSync}</td>
												</tr>
											))
										)}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Cloud Relay Sync — Cross-Location */}
			<div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden mt-10">
				<div className="p-8 border-b border-slate-100 bg-sky-50/50">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<div className="w-12 h-12 bg-sky-100 rounded-2xl flex items-center justify-center">
								<Cloud className="text-sky-600" size={24} />
							</div>
							<div>
								<h2 className="text-xl font-bold text-slate-800">Cloud Relay Sync</h2>
								<p className="text-sm text-slate-500">Sync across different locations over the internet.</p>
							</div>
						</div>
						{relayStatus && (
							<div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${relayStatus === 'connected' ? 'bg-green-100 text-green-700' : relayStatus === 'syncing' ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-500'}`}>
								{relayStatus}
							</div>
						)}
					</div>
				</div>

				<div className="p-8">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
						<div className="space-y-5">
							<div>
								<label className="text-xs font-bold text-slate-400 uppercase mb-2 block tracking-tight">Backend API URL</label>
								<input
									type="text"
									value={settings.backendUrl || 'https://ashray-backend-2nt7.onrender.com'}
									onChange={(e) => handleChange('backendUrl', e.target.value)}
									disabled={!isEditing}
									className={`w-full px-4 py-3 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 ${!isEditing ? 'bg-slate-50 text-slate-600' : 'bg-white text-slate-800'}`}
								/>
								<p className="text-xs text-slate-400 mt-1">This server acts as a relay — Master pushes, Clients pull.</p>
							</div>

							<div className="flex items-center justify-between p-4 bg-sky-50 rounded-xl border border-sky-100">
								<div>
									<p className="font-bold text-slate-800">Auto-Sync (Cloud)</p>
									<p className="text-sm text-slate-500">Periodically sync data via the cloud relay</p>
								</div>
								<div
									onClick={() => isEditing && handleChange('autoSync', !settings.autoSync)}
									className={`relative inline-block w-14 h-7 transition duration-200 ease-in-out rounded-full ${isEditing ? 'cursor-pointer' : 'cursor-default'} ${settings.autoSync ? 'bg-sky-500' : 'bg-slate-300'}`}
								>
									<span className={`absolute top-0.5 left-0.5 inline-block w-6 h-6 bg-white rounded-full shadow-lg transform transition-transform duration-200 ease-in-out ${settings.autoSync ? 'translate-x-7' : 'translate-x-0'}`} />
								</div>
							</div>

							<div className="flex gap-3">
								<button
									onClick={handleWebsiteSync}
									disabled={websiteSyncing}
									className="flex-1 bg-sky-600 text-white px-4 py-3 rounded-xl text-sm font-bold hover:bg-sky-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
								>
									<RefreshCw size={16} className={websiteSyncing ? 'animate-spin' : ''} />
									{websiteSyncing ? 'Syncing...' : 'Push to Cloud'}
								</button>
								<button
									onClick={handlePullFromCloud}
									disabled={cloudPulling}
									className="flex-1 bg-white border-2 border-sky-200 text-sky-700 px-4 py-3 rounded-xl text-sm font-bold hover:bg-sky-50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
								>
									<Download size={16} className={cloudPulling ? 'animate-bounce' : ''} />
									{cloudPulling ? 'Pulling...' : 'Pull from Cloud'}
								</button>
							</div>

							{lastCloudSync && (
								<div className="text-xs text-slate-400 flex items-center gap-1">
									<Activity size={12} /> Last cloud sync: {lastCloudSync}
								</div>
							)}
						</div>

						<div className="bg-sky-50/50 rounded-2xl border border-sky-100 p-6">
							<h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
								<Globe size={18} className="text-sky-500" /> How Cloud Relay Works
							</h4>
							<ol className="space-y-3 text-sm text-slate-600">
								<li className="flex gap-3">
									<span className="w-6 h-6 bg-sky-100 rounded-full flex items-center justify-center text-xs font-bold text-sky-600 shrink-0">1</span>
									<span><strong>Master device</strong> pushes data to the cloud relay (backend URL above).</span>
								</li>
								<li className="flex gap-3">
									<span className="w-6 h-6 bg-sky-100 rounded-full flex items-center justify-center text-xs font-bold text-sky-600 shrink-0">2</span>
									<span><strong>Client devices</strong> pull data from the same cloud relay using the sync code.</span>
								</li>
								<li className="flex gap-3">
									<span className="w-6 h-6 bg-sky-100 rounded-full flex items-center justify-center text-xs font-bold text-sky-600 shrink-0">3</span>
									<span>Enable <strong>Auto-Sync</strong> to automatically push/pull every 5 minutes.</span>
								</li>
								<li className="flex gap-3">
									<span className="w-6 h-6 bg-sky-100 rounded-full flex items-center justify-center text-xs font-bold text-sky-600 shrink-0">4</span>
									<span>Works across different locations, IPs, and networks — no VPN needed.</span>
								</li>
							</ol>
							<div className="mt-4 p-3 bg-yellow-50 border border-yellow-100 rounded-xl text-xs text-yellow-800">
								<AlertTriangle size={14} className="inline mr-1" />
								For initial setup, use <strong>Add Device</strong> to export/import the full data package first. Cloud Relay keeps subsequent changes in sync.
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Device Sync Modal */}
			{showSyncModal && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
					<div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
						<div className="p-6 border-b border-slate-100 bg-blue-50 sticky top-0 z-10">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<Share2 className="text-blue-600" size={24} />
									<div>
										<h3 className="text-xl font-bold text-slate-800">Transfer Data</h3>
										<p className="text-sm text-blue-600">Move data between devices</p>
									</div>
								</div>
								<button onClick={() => setShowSyncModal(false)} className="p-2 hover:bg-slate-200/50 rounded-xl">
									<svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
								</button>
							</div>
						</div>

						<div className="p-6 space-y-6">
							{syncMessage2 && (
								<div className={`p-4 rounded-xl text-sm font-bold ${syncMessage2.includes("✅") ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"}`}>
									{syncMessage2}
								</div>
							)}

							{/* Tab: Export / Import */}
							<div className="flex bg-slate-100 rounded-xl p-1">
								<button
									onClick={() => { setSyncMode("export"); setSyncMessage2(null); }}
									className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${syncMode === "export" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
								>
									<Download size={16} className="inline mr-1.5" />
									Export Data
								</button>
								<button
									onClick={() => { setSyncMode("import"); setSyncPackage(null); setSyncMessage2(null); }}
									className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${syncMode === "import" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
								>
									<Import size={16} className="inline mr-1.5" />
									Import Data
								</button>
							</div>

							{syncMode === "export" && (
								<div className="space-y-4">
									<p className="text-sm text-slate-600">
										Generate a sync package and code. Give both to your new device.
									</p>

									<button
										onClick={handleExportSyncPackage}
										disabled={syncLoading}
										className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
									>
										{syncLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Download size={18} /> Generate Sync Package</>}
									</button>

									{generatedSyncCode && (
										<div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-5">
											<p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-1">Sync Code (give this to new device)</p>
											<div className="flex items-center gap-3">
												<p className="text-3xl font-mono font-bold text-blue-700 tracking-[0.3em] flex-1">{generatedSyncCode}</p>
												<button
													onClick={() => {
														navigator.clipboard?.writeText(generatedSyncCode);
														setSyncCopied(true);
														setTimeout(() => setSyncCopied(false), 2000);
													}}
													className="px-4 py-2.5 bg-white rounded-xl border border-blue-200 text-blue-700 font-bold text-sm hover:bg-blue-100 transition-all flex items-center gap-2"
												>
													{syncCopied ? <Check size={16} /> : <Copy size={16} />}
													{syncCopied ? 'Copied' : 'Copy'}
												</button>
											</div>
											<p className="text-xs text-blue-500 mt-2">Enter this code in the new device's import section to pair them.</p>
										</div>
									)}

									{syncPackage && (
										<div className="space-y-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
											<p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">✅ Data Package Ready</p>

											<div className="flex gap-2">
												<button onClick={handleCopySyncCode} className="flex-1 bg-white border border-slate-200 text-slate-700 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
													{syncCopied ? <><Check size={16} className="text-green-500" /> Copied</> : <><Clipboard size={16} /> Copy Package to Clipboard</>}
												</button>
												<button onClick={handleDownloadSyncPackage} className="flex-1 bg-white border border-slate-200 text-slate-700 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
													<HardDrive size={16} /> Download File
												</button>
											</div>

											<div className="bg-white rounded-lg border border-slate-200 p-3">
												<p className="text-xs font-medium text-slate-500 mb-2">Package: {(syncPackage.length / 1024).toFixed(1)} KB, {(syncPackage.match(/"id":/g) || []).length} records</p>
											</div>

											<div className="bg-slate-100 rounded-lg p-3">
												<p className="text-xs text-slate-500 font-medium mb-1 text-center">Send file to new device via</p>
												<div className="flex gap-2 justify-center">
													<a href={`mailto:?subject=Ashray Ledger Sync&body=Sync Code: ${generatedSyncCode || ''}%0A%0A1. Install Ashray Ledger on the new device%0A2. Choose 'Connect to Existing Network'%0A3. Enter this sync code: ${generatedSyncCode || ''}%0A4. Save the attached .json file to pendrive and import it on the new device`} className="px-3 py-2 bg-white rounded-lg border border-slate-200 text-sm hover:bg-blue-50 transition-all flex items-center gap-1.5">
														<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg>
														Email
													</a>
													<button onClick={handleDownloadSyncPackage} className="px-3 py-2 bg-white rounded-lg border border-slate-200 text-sm hover:bg-green-50 transition-all flex items-center gap-1.5">
														<HardDrive size={14} /> Pendrive
													</button>
												</div>
											</div>
										</div>
									)}

									{syncMessage2 && !syncMessage2.includes('✅') && (
										<div className="p-4 rounded-xl text-sm font-bold bg-red-50 text-red-700 border border-red-100">{syncMessage2}</div>
									)}
								</div>
							)}

							{syncMode === "import" && (
								<div className="space-y-5">
									{/* Method 1: File Upload */}
									<div className="space-y-2">
										<h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
											<FileUp size={16} className="text-blue-500" /> Import from File
										</h4>
										<div
											className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${dragOver ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300 bg-slate-50/50"}`}
											onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
											onDragLeave={() => setDragOver(false)}
											onDrop={(e) => {
												e.preventDefault();
												setDragOver(false);
												const file = e.dataTransfer.files[0];
												if (file) handleImportFromFile(file);
											}}
											onClick={() => document.getElementById("sync-file-input")?.click()}
										>
											<Upload size={32} className="mx-auto text-slate-300 mb-3" />
											<p className="text-sm font-bold text-slate-600">Drop a sync file here or click to browse</p>
											<p className="text-xs text-slate-400 mt-1">Supports .json files from Ashray Ledger backup</p>
										</div>
										<input
											id="sync-file-input"
											type="file"
											accept=".json"
											className="hidden"
											onChange={(e) => {
												const file = e.target.files?.[0];
												if (file) handleImportFromFile(file);
												e.target.value = "";
											}}
										/>
									</div>

									{/* Method 2: Clipboard */}
									<div className="space-y-2">
										<h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
											<Clipboard size={16} className="text-purple-500" /> Import from Clipboard
										</h4>
										<button
											onClick={handleImportFromClipboard}
											disabled={syncLoading}
											className="w-full bg-white border-2 border-purple-200 text-purple-700 py-2.5 rounded-xl font-bold hover:bg-purple-50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
										>
											{<><Clipboard size={16} /> Paste & Import from Clipboard</>}
										</button>
									</div>

									{/* Method 3: LAN Sync Code */}
									<div className="space-y-2">
										<h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
											<Wifi size={16} className="text-green-500" /> Import via LAN Sync Code
										</h4>
										<div className="flex gap-2">
											<input
												type="text"
												placeholder="Enter sync code from other device"
												value={syncCodeInput}
												onChange={(e) => setSyncCodeInput(e.target.value.toUpperCase())}
												className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
											/>
											<button
												onClick={handleImportFromSyncCode}
												disabled={syncLoading}
												className="bg-green-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-green-700 transition-all disabled:opacity-50 flex items-center gap-2"
											>
												<Smartphone size={16} /> Sync
											</button>
										</div>
										<p className="text-xs text-slate-400">Both devices must be on the same LAN. Set one as Master and enter its sync code here.</p>
									</div>

									{/* Method 4: Google Drive / Cloud — Instructions */}
									<div className="space-y-2">
										<h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
											<Cloud size={16} className="text-sky-500" /> Cloud / Drive Import
										</h4>
										<div className="bg-sky-50 border border-sky-100 rounded-xl p-4 text-sm text-sky-800">
											<p className="font-medium mb-1">Instructions:</p>
											<ol className="list-decimal list-inside space-y-1 text-xs text-sky-700">
												<li>Export a sync package from your other device and save it to Google Drive / Dropbox / OneDrive</li>
												<li>Download the <code>.json</code> file to this device</li>
												<li>Use <strong>"Import from File"</strong> above to select it</li>
											</ol>
										</div>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
