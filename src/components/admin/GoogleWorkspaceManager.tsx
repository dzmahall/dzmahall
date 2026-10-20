import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Mail, 
  HardDrive, 
  FileText, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Play, 
  RefreshCw, 
  ExternalLink, 
  LogOut, 
  ShieldCheck, 
  Layers, 
  Settings, 
  Download, 
  Send, 
  FolderPlus, 
  Plus, 
  HelpCircle,
  FileCheck,
  AlertTriangle
} from 'lucide-react';

import { 
  googleSignIn, 
  logoutGoogle, 
  getAccessToken, 
  initAuth, 
  isTokenValid,
  WORKSPACE_SCOPES
} from '../../lib/workspace/googleAuth';

import { 
  testGoogleService, 
  ServiceTestResult,
  createOrdersSpreadsheet,
  syncOrdersToSheet,
  sendGmailMessage,
  buildOrderNotificationEmail,
  buildLowStockAlertEmail,
  ensureDzMahallDriveHierarchy,
  uploadFileToDrive,
  generateOrdersCsvContent,
  createGoogleDocsReport,
  createOrderConfirmationCallEvent
} from '../../lib/workspace/googleWorkspaceService';

import { DzMahallOrder, Shipment } from '../../lib/shipping/types';
import { Product } from '../../lib/ecommerce/types';
import { ALGERIAN_WILAYAS } from '../../lib/shipping/algerian-data';

interface GoogleWorkspaceManagerProps {
  orders: DzMahallOrder[];
  shipments: Shipment[];
  products: Product[];
  onRefreshOrders?: () => Promise<void>;
}

type TabType = 'overview' | 'sheets' | 'gmail' | 'drive' | 'docs' | 'calendar' | 'guide';

export const GoogleWorkspaceManager: React.FC<GoogleWorkspaceManagerProps> = ({
  orders,
  shipments,
  products
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // État d'authentification Google
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // État des tests de connexion
  const [testResults, setTestResults] = useState<Record<string, ServiceTestResult>>({});
  const [testingService, setTestingService] = useState<string | null>(null);
  const [isTestingAll, setIsTestingAll] = useState(false);

  // Google Sheets state
  const [spreadsheetId, setSpreadsheetId] = useState<string>('');
  const [spreadsheetUrl, setSpreadsheetUrl] = useState<string>('');
  const [isCreatingSheet, setIsCreatingSheet] = useState(false);
  const [isSyncingSheet, setIsSyncingSheet] = useState(false);
  const [sheetSyncSuccess, setSheetSyncSuccess] = useState<string | null>(null);
  const [selectedWilayaFilter, setSelectedWilayaFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');

  // Gmail state
  const [notificationRecipient, setNotificationRecipient] = useState('ntipro360@gmail.com');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);
  const [notifyOnNewOrder, setNotifyOnNewOrder] = useState(true);
  const [notifyOnLowStock, setNotifyOnLowStock] = useState(true);

  // Google Drive state
  const [driveFolderUrl, setDriveFolderUrl] = useState<string | null>(null);
  const [isArchivingDrive, setIsArchivingDrive] = useState(false);
  const [driveArchiveStatus, setDriveArchiveStatus] = useState<string | null>(null);

  // Google Docs state
  const [isGeneratingDoc, setIsGeneratingDoc] = useState(false);
  const [lastGeneratedDoc, setLastGeneratedDoc] = useState<{ title: string; url: string } | null>(null);
  const [selectedReportType, setSelectedReportType] = useState<'daily' | 'carriers' | 'profitability'>('daily');

  // Google Calendar state
  const [selectedOrderForCalendar, setSelectedOrderForCalendar] = useState<string>(orders[0]?.id || '');
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [calendarEventUrl, setCalendarEventUrl] = useState<string | null>(null);

  // Feedback global
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Initialisation de l'authentification
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setIsAuthenticated(true);
        setUserEmail(user.email || 'ntipro360@gmail.com');
        setUserName(user.displayName || 'Administrateur DzMahall');
        setUserPhoto(user.photoURL);
      },
      () => {
        setIsAuthenticated(false);
        setUserEmail(null);
        setUserName(null);
        setUserPhoto(null);
      }
    );

    return () => unsubscribe();
  }, []);

  // Connexion Google OAuth
  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setGlobalError(null);
    try {
      const res = await googleSignIn();
      setIsAuthenticated(true);
      setUserEmail(res.user.email);
      setUserName(res.user.displayName);
      setUserPhoto(res.user.photoURL);
      // Lancer immédiatement un diagnostic complet pour vérifier les permissions
      await handleTestAll(res.accessToken);
    } catch (err: any) {
      setGlobalError(err.message || 'Échec de la connexion avec votre compte Google.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logoutGoogle();
    setIsAuthenticated(false);
    setUserEmail(null);
    setTestResults({});
    setSpreadsheetUrl('');
  };

  // Test individuel d'un service
  const handleTestService = async (service: 'sheets' | 'gmail' | 'drive' | 'docs' | 'calendar') => {
    const token = await getAccessToken();
    if (!token) {
      setGlobalError('Veuillez connecter votre compte Google pour tester ce service.');
      return;
    }

    setTestingService(service);
    try {
      const result = await testGoogleService(service, token);
      setTestResults(prev => ({ ...prev, [service]: result }));
    } finally {
      setTestingService(null);
    }
  };

  // Diagnostic complet de l'ensemble des 5 services
  const handleTestAll = async (forcedToken?: string) => {
    const token = forcedToken || (await getAccessToken());
    if (!token) {
      setGlobalError('Veuillez d’abord autoriser la connexion avec votre compte Google.');
      return;
    }

    setIsTestingAll(true);
    setGlobalError(null);

    const services: ('sheets' | 'gmail' | 'drive' | 'docs' | 'calendar')[] = [
      'sheets', 'gmail', 'drive', 'docs', 'calendar'
    ];

    const results: Record<string, ServiceTestResult> = {};
    for (const s of services) {
      const res = await testGoogleService(s, token);
      results[s] = res;
    }

    setTestResults(results);
    setIsTestingAll(false);
  };

  // Helper pour obtenir le statut d'un service
  const getServiceStatus = (serviceKey: 'sheets' | 'gmail' | 'drive' | 'docs' | 'calendar') => {
    if (!isAuthenticated) return { label: 'Non configurée', color: 'bg-slate-100 text-slate-700' };
    const res = testResults[serviceKey];
    if (!res) return { label: 'Autorisation requise', color: 'bg-amber-100 text-amber-800' };
    if (res.success) return { label: 'Connectée & Validée', color: 'bg-emerald-100 text-emerald-800' };
    return { label: 'Erreur', color: 'bg-rose-100 text-rose-800' };
  };

  // --- ACTIONS GOOGLE SHEETS ---
  const handleCreateNewSpreadsheet = async () => {
    const token = await getAccessToken();
    if (!token) return;

    if (!window.confirm('Voulez-vous créer un nouveau classeur de suivi des commandes "DzMahall - Suivi COD Algérie" sur votre Google Sheets ?')) {
      return;
    }

    setIsCreatingSheet(true);
    try {
      const res = await createOrdersSpreadsheet(token);
      setSpreadsheetId(res.spreadsheetId);
      setSpreadsheetUrl(res.spreadsheetUrl);
      setSheetSyncSuccess('Classeur Google Sheets créé avec succès avec les en-têtes officiels !');
    } catch (err: any) {
      setGlobalError(err.message);
    } finally {
      setIsCreatingSheet(false);
    }
  };

  const handleSyncOrdersToSheet = async () => {
    const token = await getAccessToken();
    if (!token) return;

    let targetId = spreadsheetId;
    if (!targetId) {
      // Si pas encore de classeur créé, en créer un automatiquement
      setIsCreatingSheet(true);
      try {
        const newSheet = await createOrdersSpreadsheet(token);
        targetId = newSheet.spreadsheetId;
        setSpreadsheetId(targetId);
        setSpreadsheetUrl(newSheet.spreadsheetUrl);
      } catch (err: any) {
        setGlobalError(err.message);
        setIsCreatingSheet(false);
        return;
      }
      setIsCreatingSheet(false);
    }

    if (!window.confirm(`Confirmez-vous l'exportation de ${orders.length} commande(s) vers votre classeur Google Sheets ?`)) {
      return;
    }

    setIsSyncingSheet(true);
    try {
      const result = await syncOrdersToSheet(token, targetId, orders, shipments, {
        filterStatus: selectedStatusFilter,
        filterWilaya: selectedWilayaFilter
      });
      setSheetSyncSuccess(`${result.addedCount} commande(s) synchronisée(s) avec succès dans Google Sheets !`);
    } catch (err: any) {
      setGlobalError(err.message);
    } finally {
      setIsSyncingSheet(false);
    }
  };

  // --- ACTIONS GMAIL ---
  const handleSendTestEmail = async () => {
    const token = await getAccessToken();
    if (!token) return;

    if (!window.confirm(`Envoyer un e-mail de test via l'API Gmail à l'adresse ${notificationRecipient} ?`)) {
      return;
    }

    setIsSendingEmail(true);
    setEmailStatus(null);
    try {
      const sampleOrder = orders[0] || {
        id: 'ord_test',
        orderNumber: 'DM-2026-TEST',
        createdAt: new Date().toISOString(),
        customerName: 'Amina Mansouri',
        customerPhone: '0660 76 93 86',
        wilayaCode: '16',
        wilayaName: 'Alger',
        commune: 'Hydra',
        deliveryMode: 'domicile',
        totalDzd: 8900
      } as DzMahallOrder;

      const template = buildOrderNotificationEmail(sampleOrder);
      const res = await sendGmailMessage(token, {
        to: notificationRecipient,
        subject: template.subject,
        htmlBody: template.htmlBody
      });

      setEmailStatus(`E-mail envoyé avec succès via Gmail (ID: ${res.messageId}) !`);
    } catch (err: any) {
      setGlobalError(err.message);
    } finally {
      setIsSendingEmail(false);
    }
  };

  // --- ACTIONS GOOGLE DRIVE ---
  const handleArchiveOrdersToDrive = async () => {
    const token = await getAccessToken();
    if (!token) return;

    if (!window.confirm('Voulez-vous générer et enregistrer l’archive CSV de toutes les commandes dans votre Google Drive ?')) {
      return;
    }

    setIsArchivingDrive(true);
    setDriveArchiveStatus(null);
    try {
      const hierarchy = await ensureDzMahallDriveHierarchy(token);
      setDriveFolderUrl(hierarchy.folderUrl);

      const csvContent = generateOrdersCsvContent(orders);
      const fileName = `DzMahall_Commandes_${new Date().toISOString().slice(0, 10)}.csv`;

      await uploadFileToDrive(
        token, 
        hierarchy.currentMonthFolderId, 
        fileName, 
        'text/csv', 
        csvContent
      );

      setDriveArchiveStatus(`Fichier "${fileName}" archivé avec succès dans Google Drive !`);
    } catch (err: any) {
      setGlobalError(err.message);
    } finally {
      setIsArchivingDrive(false);
    }
  };

  // --- ACTIONS GOOGLE DOCS ---
  const handleGenerateGoogleDocsReport = async () => {
    const token = await getAccessToken();
    if (!token) return;

    if (!window.confirm(`Confirmez-vous la génération du rapport "${selectedReportType.toUpperCase()}" dans Google Docs ?`)) {
      return;
    }

    setIsGeneratingDoc(true);
    setLastGeneratedDoc(null);
    try {
      const res = await createGoogleDocsReport(token, {
        reportType: selectedReportType,
        orders,
        shipments
      });
      setLastGeneratedDoc({ title: res.title, url: res.documentUrl });
    } catch (err: any) {
      setGlobalError(err.message);
    } finally {
      setIsGeneratingDoc(false);
    }
  };

  // --- ACTIONS GOOGLE CALENDAR ---
  const handleCreateOrderCalendarEvent = async () => {
    const token = await getAccessToken();
    if (!token) return;

    const targetOrder = orders.find(o => o.id === selectedOrderForCalendar) || orders[0];
    if (!targetOrder) {
      setGlobalError('Aucune commande sélectionnée.');
      return;
    }

    if (!window.confirm(`Créer un rappel d'appel téléphonique pour la commande ${targetOrder.orderNumber} (${targetOrder.customerName}) dans Google Calendar ?`)) {
      return;
    }

    setIsCreatingEvent(true);
    setCalendarEventUrl(null);
    try {
      const res = await createOrderConfirmationCallEvent(token, targetOrder);
      setCalendarEventUrl(res.eventUrl);
    } catch (err: any) {
      setGlobalError(err.message);
    } finally {
      setIsCreatingEvent(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. En-tête officiel Google Workspace */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span>Google Workspace & Automatisations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Intégration Google Workspace
          </h1>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            Connectez DzMahall à votre compte Google afin d'automatiser le suivi des commandes (Google Sheets), les alertes par e-mail (Gmail), l'archivage (Google Drive), les bilans (Google Docs) et les rappels (Google Calendar).
          </p>
        </div>

        {/* Zone d'authentification Google */}
        <div className="shrink-0 flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {isAuthenticated ? (
            <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl w-full sm:w-auto">
              {userPhoto ? (
                <img src={userPhoto} alt="Profil" className="w-10 h-10 rounded-full border border-slate-300" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-700 text-white font-bold flex items-center justify-center text-sm">
                  {userName ? userName.charAt(0) : 'G'}
                </div>
              )}
              <div className="text-xs">
                <span className="font-bold text-slate-900 block truncate max-w-[160px]">{userName}</span>
                <span className="text-slate-500 font-mono text-[11px] block truncate max-w-[160px]">{userEmail}</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white transition-colors"
                title="Déconnecter Google"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleGoogleLogin}
              disabled={isLoggingIn}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-5 py-3 rounded-2xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs shadow-xs transition-all hover:border-slate-400 disabled:opacity-50"
            >
              {/* Google G SVG */}
              <svg className="w-4 h-4" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              <span>{isLoggingIn ? 'Connexion en cours...' : 'Connecter avec Google'}</span>
            </button>
          )}

          {isAuthenticated && (
            <button
              onClick={() => handleTestAll()}
              disabled={isTestingAll}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTestingAll ? 'animate-spin' : ''}`} />
              <span>Diagnostiquer les 5 Services</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages d'erreur globaux */}
      {globalError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-xs text-rose-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{globalError}</span>
          </div>
          <button onClick={() => setGlobalError(null)} className="text-rose-500 hover:text-rose-700 font-bold">
            Fermer
          </button>
        </div>
      )}

      {/* Navigation des sous-onglets Workspace */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs font-semibold">
        {[
          { id: 'overview', label: 'Vue d’ensemble & Statuts', icon: Layers },
          { id: 'sheets', label: 'Google Sheets', icon: FileSpreadsheet },
          { id: 'gmail', label: 'Gmail', icon: Mail },
          { id: 'drive', label: 'Google Drive', icon: HardDrive },
          { id: 'docs', label: 'Google Docs', icon: FileText },
          { id: 'calendar', label: 'Google Calendar', icon: CalendarIcon },
          { id: 'guide', label: 'Guide Google Cloud', icon: HelpCircle },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap shrink-0 ${
                isActive 
                  ? 'bg-slate-900 text-white shadow-xs font-bold' 
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ============================================================== */}
      {/* ONGLET 1 : VUE D'ENSEMBLE DES 5 SERVICES                       */}
      {/* ============================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* 1. Google Sheets Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${getServiceStatus('sheets').color}`}>
                    {getServiceStatus('sheets').label}
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Google Sheets</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Exportez et synchronisez en temps réel l'ensemble de vos commandes COD vers un classeur partagé avec colonnes configurables.
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Commandes prêtes :</span>
                  <strong className="text-slate-900">{orders.length}</strong>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('sheets')}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold text-center"
                  >
                    Configurer
                  </button>
                  <button
                    onClick={() => handleTestService('sheets')}
                    disabled={testingService === 'sheets' || !isAuthenticated}
                    className="py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold disabled:opacity-50"
                  >
                    {testingService === 'sheets' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Tester'}
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Gmail Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                    <Mail className="w-6 h-6" />
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${getServiceStatus('gmail').color}`}>
                    {getServiceStatus('gmail').label}
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Gmail</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Recevez des notifications immédiates pour chaque nouvelle commande client, alertes de stock faible et bilans journaliers.
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Destinataire configuré :</span>
                  <span className="text-slate-900 font-mono text-[11px] truncate max-w-[120px]">{notificationRecipient}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('gmail')}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold text-center"
                  >
                    Gérer Alertes
                  </button>
                  <button
                    onClick={() => handleTestService('gmail')}
                    disabled={testingService === 'gmail' || !isAuthenticated}
                    className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold disabled:opacity-50"
                  >
                    {testingService === 'gmail' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Tester'}
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Google Drive Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <HardDrive className="w-6 h-6" />
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${getServiceStatus('drive').color}`}>
                    {getServiceStatus('drive').label}
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Google Drive</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Structurez automatiquement les sauvegardes de vos commandes et exports CSV dans une arborescence Année / Mois / Documents.
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Dossier racine :</span>
                  <strong className="text-slate-900">DzMahall E-Commerce</strong>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('drive')}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold text-center"
                  >
                    Archivage
                  </button>
                  <button
                    onClick={() => handleTestService('drive')}
                    disabled={testingService === 'drive' || !isAuthenticated}
                    className="py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold disabled:opacity-50"
                  >
                    {testingService === 'drive' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Tester'}
                  </button>
                </div>
              </div>
            </div>

            {/* 4. Google Docs Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <FileText className="w-6 h-6" />
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${getServiceStatus('docs').color}`}>
                    {getServiceStatus('docs').label}
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Google Docs</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Générez en 1 clic des bilans journaliers, des analyses de performance transporteurs et des rapports de rentabilité complets.
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Modèles de bilans :</span>
                  <strong className="text-slate-900">3 rapports prêts</strong>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('docs')}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold text-center"
                  >
                    Générer Bilan
                  </button>
                  <button
                    onClick={() => handleTestService('docs')}
                    disabled={testingService === 'docs' || !isAuthenticated}
                    className="py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold disabled:opacity-50"
                  >
                    {testingService === 'docs' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Tester'}
                  </button>
                </div>
              </div>
            </div>

            {/* 5. Google Calendar Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    <CalendarIcon className="w-6 h-6" />
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${getServiceStatus('calendar').color}`}>
                    {getServiceStatus('calendar').label}
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Google Calendar</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Planifiez automatiquement les appels de validation des commandes COD et les créneaux d'expédition avec vos transporteurs.
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Rappels COD :</span>
                  <strong className="text-slate-900">Appels & Expéditions</strong>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('calendar')}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold text-center"
                  >
                    Planifier
                  </button>
                  <button
                    onClick={() => handleTestService('calendar')}
                    disabled={testingService === 'calendar' || !isAuthenticated}
                    className="py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold disabled:opacity-50"
                  >
                    {testingService === 'calendar' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Tester'}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ONGLET 2 : GOOGLE SHEETS                                       */}
      {/* ============================================================== */}
      {activeTab === 'sheets' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <span>Export & Suivi des Commandes sur Google Sheets</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Alimente automatiquement votre feuille de calcul avec identifiants stables anti-doublons.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {spreadsheetUrl && (
                <a
                  href={spreadsheetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Ouvrir dans Google Sheets</span>
                </a>
              )}
              <button
                onClick={handleCreateNewSpreadsheet}
                disabled={!isAuthenticated || isCreatingSheet}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isCreatingSheet ? 'Création...' : 'Nouveau Classeur'}</span>
              </button>
            </div>
          </div>

          {sheetSyncSuccess && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{sheetSyncSuccess}</span>
            </div>
          )}

          {/* Filtres d'export */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Filtrer par Statut</label>
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
              >
                <option value="all">Tous les statuts</option>
                <option value="ready_for_shipping">Prêtes pour expédition</option>
                <option value="confirmed">Confirmées</option>
                <option value="shipped">Expédiées</option>
                <option value="delivered">Livrées (Encaissées)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Filtrer par Wilaya</label>
              <select
                value={selectedWilayaFilter}
                onChange={(e) => setSelectedWilayaFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
              >
                <option value="all">Toutes les 58 wilayas</option>
                {ALGERIAN_WILAYAS.map(w => (
                  <option key={w.code} value={w.code}>{w.code} - {w.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleSyncOrdersToSheet}
                disabled={!isAuthenticated || isSyncingSheet}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-50"
              >
                {isSyncingSheet ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span>Synchroniser {orders.length} Commande(s)</span>
              </button>
            </div>
          </div>

          {/* Colonnes configurées */}
          <div className="space-y-2 text-xs">
            <span className="font-bold text-slate-900 block">Structure des Colonnes Synchronisées :</span>
            <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
              {[
                'N° Commande', 'Date', 'Nom Client', 'Téléphone', 'Wilaya', 'Commune', 
                'Adresse', 'Mode (Domicile/Stop Desk)', 'Transporteur', 'N° Colis', 
                'Statut', 'Articles', 'Sous-Total (DZD)', 'Frais Port (DZD)', 'Total COD (DZD)'
              ].map(col => (
                <span key={col} className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                  {col}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ONGLET 3 : GMAIL NOTIFICATIONS                                 */}
      {/* ============================================================== */}
      {activeTab === 'gmail' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Mail className="w-5 h-5 text-rose-600" />
                <span>Centre de Notifications & Alertes Gmail</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Envoi direct d'e-mails professionnels au format HTML sans intermédiaire.
              </p>
            </div>

            <button
              onClick={handleSendTestEmail}
              disabled={!isAuthenticated || isSendingEmail}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-xs transition-colors disabled:opacity-50"
            >
              {isSendingEmail ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>Envoyer un E-mail Test</span>
            </button>
          </div>

          {emailStatus && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{emailStatus}</span>
            </div>
          )}

          {/* Configuration destinataire */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-900 mb-1">
                Adresse E-mail Destinataire pour les Alertes
              </label>
              <input
                type="email"
                value={notificationRecipient}
                onChange={(e) => setNotificationRecipient(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-rose-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Adresse où vous recevrez les alertes de commandes et de stock.
              </span>
            </div>

            <div className="space-y-3 pt-2">
              <label className="block font-bold text-slate-900 mb-1">
                Déclencheurs d'Alertes Activés
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyOnNewOrder}
                  onChange={(e) => setNotifyOnNewOrder(e.target.checked)}
                  className="rounded text-rose-600"
                />
                <span className="text-slate-700">Nouvelle commande client à confirmer (COD)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyOnLowStock}
                  onChange={(e) => setNotifyOnLowStock(e.target.checked)}
                  className="rounded text-rose-600"
                />
                <span className="text-slate-700">Alerte niveau de stock critique (&lt; 5 unités)</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ONGLET 4 : GOOGLE DRIVE                                        */}
      {/* ============================================================== */}
      {activeTab === 'drive' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-blue-600" />
                <span>Archivage & Arborescence Automatisée Google Drive</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Organisation automatique dans « DzMahall E-Commerce / Année / Mois ».
              </p>
            </div>

            <div className="flex items-center gap-2">
              {driveFolderUrl && (
                <a
                  href={driveFolderUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs border border-blue-200 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Ouvrir Dossier Drive</span>
                </a>
              )}
              <button
                onClick={handleArchiveOrdersToDrive}
                disabled={!isAuthenticated || isArchivingDrive}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs transition-colors disabled:opacity-50"
              >
                {isArchivingDrive ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FolderPlus className="w-3.5 h-3.5" />}
                <span>Archiver CSV sur Google Drive</span>
              </button>
            </div>
          </div>

          {driveArchiveStatus && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{driveArchiveStatus}</span>
            </div>
          )}

          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
            <h4 className="font-bold text-slate-900">Arborescence créée sur votre Google Drive :</h4>
            <div className="font-mono text-slate-700 space-y-1.5 bg-white p-4 rounded-xl border border-slate-200">
              <div>📁 DzMahall E-Commerce/</div>
              <div className="pl-6">└── 📁 {new Date().getFullYear()}/</div>
              <div className="pl-12">└── 📁 {(new Date().getMonth() + 1).toString().padStart(2, '0')}/</div>
              <div className="pl-18 text-blue-700">├── 📄 DzMahall_Commandes_{new Date().toISOString().slice(0, 10)}.csv</div>
              <div className="pl-18 text-indigo-700">└── 📄 Bilans_Activite_Google_Docs</div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ONGLET 5 : GOOGLE DOCS                                         */}
      {/* ============================================================== */}
      {activeTab === 'docs' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <span>Générateur de Rapports & Bilans Google Docs</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Création instantanée de comptes-rendus d'activité mis en page pour la direction.
              </p>
            </div>

            <button
              onClick={handleGenerateGoogleDocsReport}
              disabled={!isAuthenticated || isGeneratingDoc}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition-colors disabled:opacity-50"
            >
              {isGeneratingDoc ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FileCheck className="w-3.5 h-3.5" />}
              <span>Générer le Document Google Docs</span>
            </button>
          </div>

          {lastGeneratedDoc && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Document <strong>{lastGeneratedDoc.title}</strong> généré avec succès !</span>
              </div>
              <a
                href={lastGeneratedDoc.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-bold underline hover:text-emerald-900"
              >
                <span>Consulter le Google Doc</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* Choix du modèle */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {[
              { id: 'daily', title: 'Bilan Journalier d’Activité', desc: 'Commandes reçues, flux financiers COD et alertes logistiques du jour.' },
              { id: 'carriers', title: 'Performance des Transporteurs', desc: 'Taux de livraison, comparaison Yalidine / Guepex / EcoTrack et retours.' },
              { id: 'profitability', title: 'Rapport de Rentabilité COD', desc: 'Marge nette, absorption des frais d’expédition et seuil de rentabilité.' },
            ].map(model => (
              <div
                key={model.id}
                onClick={() => setSelectedReportType(model.id as any)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedReportType === model.id 
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-2 ring-indigo-500/20' 
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-900">{model.title}</span>
                  <input
                    type="radio"
                    name="reportModel"
                    checked={selectedReportType === model.id}
                    onChange={() => setSelectedReportType(model.id as any)}
                    className="text-indigo-600"
                  />
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed">{model.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ONGLET 6 : GOOGLE CALENDAR                                     */}
      {/* ============================================================== */}
      {activeTab === 'calendar' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-amber-600" />
                <span>Rappels & Événements Google Calendar</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Planification des appels de confirmation client et expéditions dans votre agenda.
              </p>
            </div>

            <button
              onClick={handleCreateOrderCalendarEvent}
              disabled={!isAuthenticated || isCreatingEvent || orders.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-xs transition-colors disabled:opacity-50"
            >
              {isCreatingEvent ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              <span>Planifier l'Appel dans Calendar</span>
            </button>
          </div>

          {calendarEventUrl && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Rappel d'appel ajouté avec succès à votre Google Calendar !</span>
              </div>
              <a
                href={calendarEventUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-bold underline hover:text-emerald-900"
              >
                <span>Voir l'événement</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* Sélecteur de commande */}
          <div className="max-w-md space-y-2 text-xs">
            <label className="block font-bold text-slate-900">
              Sélectionnez la Commande COD à Planifier pour Appel Téléphonique :
            </label>
            <select
              value={selectedOrderForCalendar}
              onChange={(e) => setSelectedOrderForCalendar(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white"
            >
              {orders.map(o => (
                <option key={o.id} value={o.id}>
                  {o.orderNumber} — {o.customerName} ({o.customerPhone}) · {o.wilayaName} ({o.totalDzd.toLocaleString()} DZD)
                </option>
              ))}
            </select>
            <span className="text-[11px] text-slate-400 block">
              L'événement contiendra le nom, le numéro de téléphone et l'adresse du client avec un rappel 15 minutes avant.
            </span>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ONGLET 7 : GUIDE GOOGLE CLOUD                                  */}
      {/* ============================================================== */}
      {activeTab === 'guide' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs text-xs">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-600" />
              <span>Guide d’Aide & Configuration Google Cloud Console</span>
            </h2>
            <p className="text-slate-500 mt-1">
              Récapitulatif des paramètres configurés sur votre projet Google Cloud pour l'automatisation de DzMahall.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h3 className="font-bold text-slate-900 text-sm">Identifiants & Sécurité OAuth</h3>
              <ul className="space-y-2 text-slate-600">
                <li>• <strong>ID Client OAuth :</strong> Provisionné automatiquement via Firebase Auth.</li>
                <li>• <strong>Sécurité des Jetons :</strong> Conservés en mémoire volatile uniquement (aucune écriture dans localStorage ou base de données publique).</li>
                <li>• <strong>Compte administrateur :</strong> Accessible uniquement par l'administrateur de la boutique (aucun accès demandé aux clients acheteurs).</li>
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h3 className="font-bold text-slate-900 text-sm">APIs Google Workspace Activées</h3>
              <ul className="space-y-2 text-slate-600">
                <li>• <strong>Google Sheets API v4 :</strong> Création et ajout de lignes dans les classeurs.</li>
                <li>• <strong>Gmail API v1 :</strong> Envoi d'alertes par e-mail en cas de nouvelle commande.</li>
                <li>• <strong>Google Drive API v3 :</strong> Création d'arborescence et archivage CSV.</li>
                <li>• <strong>Google Docs API v1 :</strong> Génération automatique de bilans d'activité.</li>
                <li>• <strong>Google Calendar API v3 :</strong> Planification des rappels de confirmation client.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
