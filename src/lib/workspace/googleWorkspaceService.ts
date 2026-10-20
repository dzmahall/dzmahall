/**
 * DzMahall - Service Google Workspace APIs
 * Google Sheets, Gmail, Google Drive, Google Docs, Google Calendar
 */

import { DzMahallOrder, Shipment } from '../shipping/types';
import { Product } from '../ecommerce/types';

export interface ServiceTestResult {
  service: 'sheets' | 'gmail' | 'drive' | 'docs' | 'calendar';
  name: string;
  success: boolean;
  httpStatus?: number;
  message: string;
  latencyMs: number;
  details?: any;
}

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  createdTime?: string;
}

// ==============================================================
// 1. DIAGNOSTICS & TESTS RÉELS DE CONNEXION INDÉPENDANTS
// ==============================================================

export const testGoogleService = async (
  service: 'sheets' | 'gmail' | 'drive' | 'docs' | 'calendar',
  token: string
): Promise<ServiceTestResult> => {
  const start = Date.now();
  try {
    let url = '';
    let method = 'GET';
    let body: any = null;

    switch (service) {
      case 'sheets':
        // Teste la capacité à créer un classeur de test ou lister les métadonnées
        url = 'https://sheets.googleapis.com/v4/spreadsheets?fields=spreadsheetId';
        method = 'POST';
        body = JSON.stringify({
          properties: { title: `[DzMahall Test Connexion] - ${new Date().toLocaleTimeString()}` }
        });
        break;
      case 'gmail':
        // Teste l'accès au profil Gmail de l'utilisateur
        url = 'https://gmail.googleapis.com/gmail/v1/users/me/profile';
        break;
      case 'drive':
        // Teste la recherche de fichiers Drive avec pageSize=1
        url = 'https://www.googleapis.com/drive/v3/files?pageSize=1&fields=files(id,name)';
        break;
      case 'docs':
        // Teste la création d'un document temporaire de test
        url = 'https://docs.googleapis.com/v1/documents';
        method = 'POST';
        body = JSON.stringify({
          title: `[DzMahall Test Connexion] - ${new Date().toLocaleTimeString()}`
        });
        break;
      case 'calendar':
        // Teste l'accès aux métadonnées du calendrier principal
        url = 'https://www.googleapis.com/calendar/v3/calendars/primary';
        break;
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`
    };
    if (body) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(url, { method, headers, body });
    const latency = Date.now() - start;
    const data = await res.json().catch(() => ({}));

    if (res.ok) {
      // Pour les tests créant un document temporaire (sheets/docs), supprimer immédiatement le fichier de test
      if (service === 'sheets' && data.spreadsheetId) {
        deleteDriveFileSilently(token, data.spreadsheetId);
      } else if (service === 'docs' && data.documentId) {
        deleteDriveFileSilently(token, data.documentId);
      }

      return {
        service,
        name: getServiceName(service),
        success: true,
        httpStatus: res.status,
        message: `Connexion active et vérifiée avec succès (latence: ${latency}ms).`,
        latencyMs: latency,
        details: data
      };
    } else {
      const errMessage = data?.error?.message || `Erreur HTTP ${res.status}: ${res.statusText}`;
      return {
        service,
        name: getServiceName(service),
        success: false,
        httpStatus: res.status,
        message: errMessage,
        latencyMs: latency,
        details: data
      };
    }
  } catch (err: any) {
    const latency = Date.now() - start;
    return {
      service,
      name: getServiceName(service),
      success: false,
      message: err.message || 'Erreur réseau ou permission manquante.',
      latencyMs: latency
    };
  }
};

const deleteDriveFileSilently = async (token: string, fileId: string) => {
  try {
    await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch {
    // Nettoyage discret
  }
};

const getServiceName = (s: string) => {
  switch (s) {
    case 'sheets': return 'Google Sheets';
    case 'gmail': return 'Gmail';
    case 'drive': return 'Google Drive';
    case 'docs': return 'Google Docs';
    case 'calendar': return 'Google Calendar';
    default: return s;
  }
};

// ==============================================================
// 2. GOOGLE SHEETS : EXPORT & SYNCHRONISATION DES COMMANDES
// ==============================================================

export interface SheetExportOptions {
  spreadsheetId?: string;
  sheetTitle?: string;
  filterStatus?: string;
  filterWilaya?: string;
  dateRange?: 'all' | 'today' | 'month';
}

/**
 * Crée un nouveau classeur de suivi Google Sheets pour DzMahall
 */
export const createOrdersSpreadsheet = async (
  token: string, 
  title = `DzMahall - Suivi des Commandes COD Algérie (${new Date().getFullYear()})`
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> => {
  const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      properties: { title },
      sheets: [
        {
          properties: {
            title: 'Commandes COD',
            gridProperties: { frozenRowCount: 1 }
          }
        },
        {
          properties: {
            title: 'Statistiques & Bilan'
          }
        }
      ]
    })
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Échec création classeur Google Sheets.');
  }

  const data = await res.json();
  const spreadsheetId = data.spreadsheetId;
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // Écrire les en-têtes officiels des colonnes dans la feuille Commandes COD
  const headers = [
    'N° Commande',
    'Date & Heure',
    'Nom Client',
    'Téléphone Algérie',
    'Wilaya',
    'Commune',
    'Adresse / Bureau',
    'Mode Livraison',
    'Transporteur',
    'N° Colis / Suivi',
    'Statut Commande',
    'Articles Commandés',
    'Sous-total (DZD)',
    'Frais Port (DZD)',
    'Total à Encaisser (DZD)',
    'Mode Paiement'
  ];

  await appendSheetValues(token, spreadsheetId, 'Commandes COD!A1:P1', [headers]);

  return { spreadsheetId, spreadsheetUrl };
};

/**
 * Ajoute des lignes de données dans une feuille de calcul
 */
export const appendSheetValues = async (
  token: string,
  spreadsheetId: string,
  range: string,
  values: any[][]
) => {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ values })
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Erreur lors de l’ajout des lignes dans Google Sheets.');
  }

  return res.json();
};

/**
 * Exporte les commandes réelles de DzMahall vers Google Sheets
 */
export const syncOrdersToSheet = async (
  token: string,
  spreadsheetId: string,
  orders: DzMahallOrder[],
  shipments: Shipment[],
  options?: SheetExportOptions
): Promise<{ addedCount: number; spreadsheetUrl: string }> => {
  let filtered = [...orders];

  if (options?.filterStatus && options.filterStatus !== 'all') {
    filtered = filtered.filter(o => o.status === options.filterStatus);
  }

  if (options?.filterWilaya && options.filterWilaya !== 'all') {
    filtered = filtered.filter(o => o.wilayaCode === options.filterWilaya);
  }

  if (options?.dateRange === 'today') {
    const today = new Date().toISOString().slice(0, 10);
    filtered = filtered.filter(o => o.createdAt.startsWith(today));
  } else if (options?.dateRange === 'month') {
    const currentMonth = new Date().toISOString().slice(0, 7);
    filtered = filtered.filter(o => o.createdAt.startsWith(currentMonth));
  }

  if (filtered.length === 0) {
    return { 
      addedCount: 0, 
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit` 
    };
  }

  // Convertir chaque commande en ligne
  const rows = filtered.map(order => {
    const shipment = shipments.find(s => s.orderId === order.id);
    const tracking = shipment?.trackingNumber || 'Non expédié';
    const carrierName = shipment?.carrierId || order.preferredCarrierId || 'À assigner';
    const itemsSummary = (order.items || [])
      .map(it => `${it.quantity}x ${it.name}`)
      .join(', ');

    return [
      order.orderNumber,
      new Date(order.createdAt).toLocaleString('fr-FR'),
      order.customerName,
      order.customerPhone,
      `${order.wilayaCode} - ${order.wilayaName}`,
      order.commune || '',
      order.customerAddress || order.stopDeskOfficeId || '',
      order.deliveryMode === 'stop_desk' ? 'Stop Desk (Bureau Relais)' : 'À Domicile',
      carrierName.toUpperCase(),
      tracking,
      order.status,
      itemsSummary,
      order.subtotalDzd,
      order.shippingFeeDzd,
      order.totalDzd,
      'COD (Espèces à la réception)'
    ];
  });

  await appendSheetValues(token, spreadsheetId, 'Commandes COD!A:P', rows);

  return {
    addedCount: rows.length,
    spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`
  };
};

// ==============================================================
// 3. GMAIL : NOTIFICATIONS PROFESSIONNELLES & ALERTES
// ==============================================================

export interface GmailSendPayload {
  to: string;
  subject: string;
  htmlBody: string;
}

/**
 * Envoie un e-mail réel via l'API Gmail (users.messages.send)
 */
export const sendGmailMessage = async (
  token: string, 
  payload: GmailSendPayload
): Promise<{ messageId: string }> => {
  // Construction du message RFC 2822
  const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(payload.subject)))}?=`;
  const messageParts = [
    `To: ${payload.to}`,
    `Subject: ${utf8Subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    payload.htmlBody
  ];
  const rawMessage = messageParts.join('\r\n');
  
  // Encodage base64url sécurisé
  const base64Encoded = btoa(unescape(encodeURIComponent(rawMessage)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ raw: base64Encoded })
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Échec d’envoi de l’e-mail via Gmail.');
  }

  const data = await res.json();
  return { messageId: data.id };
};

/**
 * Modèles d'e-mails pour DzMahall
 */
export const buildOrderNotificationEmail = (order: DzMahallOrder) => {
  return {
    subject: `[DzMahall] Nouvelle Commande COD ${order.orderNumber} (${order.totalDzd.toLocaleString()} DZD)`,
    htmlBody: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #0f172a; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 20px;">DzMahall · Nouvelle Commande Reçue</h1>
          <p style="margin: 5px 0 0 0; color: #38bdf8; font-size: 13px;">Paiement 100% à la livraison (COD)</p>
        </div>
        <div style="padding: 24px;">
          <p style="font-size: 15px;">Une nouvelle commande vient d'être enregistrée sur la boutique :</p>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin: 16px 0;">
            <tr><td style="padding: 8px 0; color: #64748b;">N° Commande :</td><td style="font-weight: bold;">${order.orderNumber}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b;">Client :</td><td style="font-weight: bold;">${order.customerName}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b;">Téléphone :</td><td style="font-weight: bold; font-family: monospace;">${order.customerPhone}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b;">Destination :</td><td>${order.wilayaCode} - ${order.wilayaName} (${order.commune})</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b;">Mode :</td><td>${order.deliveryMode === 'stop_desk' ? 'Bureau Stop Desk' : 'À Domicile'}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b;">Total COD :</td><td style="font-weight: bold; color: #047857; font-size: 16px;">${order.totalDzd.toLocaleString()} DZD</td></tr>
          </table>
          <div style="background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 12px; margin: 16px 0; font-size: 12px;">
            <strong>Action requise :</strong> Appelez le client au <strong style="font-family: monospace;">${order.customerPhone}</strong> pour valider l'adresse avant expédition par le transporteur.
          </div>
        </div>
        <div style="background-color: #f1f5f9; padding: 14px; text-align: center; font-size: 11px; color: #64748b;">
          DzMahall Plateforme E-Commerce Algérie · Notification automatique Gmail
        </div>
      </div>
    `
  };
};

export const buildLowStockAlertEmail = (product: Product) => {
  return {
    subject: `[Alerte Stock DzMahall] Stock Critique : ${product.name} (${product.stockQuantity} restant)`,
    htmlBody: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #fee2e2; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #b91c1c; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 20px;">⚠️ Alerte Stock Faible</h1>
          <p style="margin: 5px 0 0 0; color: #fecaca; font-size: 13px;">DzMahall Inventaire</p>
        </div>
        <div style="padding: 24px; font-size: 13px;">
          <p>Le produit suivant a atteint un niveau de stock critique :</p>
          <h2 style="color: #0f172a; font-size: 16px; margin: 12px 0;">${product.name}</h2>
          <p>Quantité restante en stock : <strong style="color: #b91c1c; font-size: 18px;">${product.stockQuantity} unité(s)</strong></p>
          <p>Catégorie : ${product.category} · Prix : ${product.price.toLocaleString()} DZD</p>
          <p style="margin-top: 16px; color: #64748b;">Pensez à réapprovisionner l'article ou à ajuster le catalogue pour éviter les commandes non honorables.</p>
        </div>
      </div>
    `
  };
};

// ==============================================================
// 4. GOOGLE DRIVE : ARBORESCENCE & ARCHIVAGE DES EXPORTS
// ==============================================================

/**
 * Recherche ou crée un dossier dans Google Drive
 */
export const findOrCreateFolder = async (
  token: string, 
  folderName: string, 
  parentId?: string
): Promise<string> => {
  let query = `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  if (parentId) {
    query += ` and '${parentId}' in parents`;
  }

  const searchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const searchData = await searchRes.json();
  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0].id;
  }

  // Création du dossier
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentId ? [parentId] : undefined
    })
  });

  const createData = await createRes.json();
  return createData.id;
};

/**
 * Prépare l'arborescence officielle DzMahall dans Google Drive :
 * DzMahall E-Commerce / AAAA / MM / Commandes & Rapports
 */
export const ensureDzMahallDriveHierarchy = async (token: string): Promise<{
  rootFolderId: string;
  currentMonthFolderId: string;
  folderUrl: string;
}> => {
  const rootId = await findOrCreateFolder(token, 'DzMahall E-Commerce');
  const currentYear = new Date().getFullYear().toString();
  const yearId = await findOrCreateFolder(token, currentYear, rootId);
  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const monthId = await findOrCreateFolder(token, currentMonth, yearId);

  return {
    rootFolderId: rootId,
    currentMonthFolderId: monthId,
    folderUrl: `https://drive.google.com/drive/folders/${rootId}`
  };
};

/**
 * Téléverse un fichier (CSV ou texte) vers un dossier Google Drive
 */
export const uploadFileToDrive = async (
  token: string,
  folderId: string,
  fileName: string,
  mimeType: string,
  content: string
): Promise<GoogleDriveFile> => {
  const metadata = {
    name: fileName,
    parents: [folderId]
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}\r\n\r\n` +
    content +
    closeDelimiter;

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,createdTime',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`
      },
      body: multipartRequestBody
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Erreur lors du téléversement sur Google Drive.');
  }

  return res.json();
};

/**
 * Génère le contenu CSV complet des commandes DzMahall
 */
export const generateOrdersCsvContent = (orders: DzMahallOrder[]): string => {
  const headers = [
    'Numero_Commande',
    'Date_Creation',
    'Nom_Client',
    'Telephone',
    'Wilaya_Code',
    'Wilaya_Nom',
    'Commune',
    'Adresse',
    'Mode_Livraison',
    'Transporteur',
    'Sous_Total_DZD',
    'Frais_Port_DZD',
    'Total_DZD',
    'Statut',
    'Mode_Paiement'
  ];

  const lines = orders.map(o => [
    `"${o.orderNumber}"`,
    `"${o.createdAt}"`,
    `"${(o.customerName || '').replace(/"/g, '""')}"`,
    `"${o.customerPhone}"`,
    `"${o.wilayaCode}"`,
    `"${o.wilayaName}"`,
    `"${(o.commune || '').replace(/"/g, '""')}"`,
    `"${(o.customerAddress || '').replace(/"/g, '""')}"`,
    `"${o.deliveryMode}"`,
    `"${o.preferredCarrierId || ''}"`,
    o.subtotalDzd,
    o.shippingFeeDzd,
    o.totalDzd,
    `"${o.status}"`,
    `"${o.paymentMethod}"`
  ].join(','));

  return [headers.join(','), ...lines].join('\r\n');
};

// ==============================================================
// 5. GOOGLE DOCS : GÉNÉRATION AUTOMATIQUE DE RAPPORTS D'ACTIVITÉ
// ==============================================================

export interface ReportGenerationParams {
  reportType: 'daily' | 'monthly' | 'carriers' | 'returns' | 'profitability';
  orders: DzMahallOrder[];
  shipments: Shipment[];
}

/**
 * Génère un document officiel Google Docs mis en page pour DzMahall
 */
export const createGoogleDocsReport = async (
  token: string,
  params: ReportGenerationParams
): Promise<{ documentId: string; documentUrl: string; title: string }> => {
  const dateStr = new Date().toLocaleDateString('fr-FR');
  let title = '';
  let content = '';

  const totalOrders = params.orders.length;
  const totalRevenue = params.orders.reduce((sum, o) => sum + o.totalDzd, 0);
  const deliveredShipments = params.shipments.filter(s => s.status === 'delivered').length;
  const returnedShipments = params.shipments.filter(s => s.status === 'returned').length;
  const totalShipments = params.shipments.length;
  const deliveryRate = totalShipments > 0 ? Math.round((deliveredShipments / totalShipments) * 100) : 0;

  switch (params.reportType) {
    case 'daily':
      title = `DzMahall · Bilan d'Activité Journalier (${dateStr})`;
      content = `DZMAHALL — RAPPORT JOURNALIER E-COMMERCE COD ALGÉRIE\n` +
        `Date d'émission : ${new Date().toLocaleString('fr-FR')}\n\n` +
        `1. RÉSUMÉ DES VENTES :\n` +
        `- Total des commandes enregistrées : ${totalOrders}\n` +
        `- Chiffre d'affaires brut estimé : ${totalRevenue.toLocaleString()} DZD\n` +
        `- Mode de règlement : 100% Paiement à la Livraison (COD)\n\n` +
        `2. ÉTAT DES EXPÉDITIONS :\n` +
        `- Colis créés : ${totalShipments}\n` +
        `- Colis livrés et encaissés : ${deliveredShipments}\n` +
        `- Colis en cours d'acheminement : ${totalShipments - deliveredShipments - returnedShipments}\n\n` +
        `3. ACTIONS COMMERCIALES ET SUIVI :\n` +
        `- Relance téléphonique des commandes en attente de confirmation.\n` +
        `- Suivi des avis de passage transporteurs dans les 58 wilayas.\n\n` +
        `Document généré automatiquement par le module DzMahall Google Workspace.`;
      break;

    case 'carriers':
      title = `DzMahall · Performance des Transporteurs Algérie (${dateStr})`;
      content = `DZMAHALL — ANALYSE COMPARATIVE DES TRANSPORTEURS ALGÉRIE\n` +
        `Date d'émission : ${new Date().toLocaleString('fr-FR')}\n\n` +
        `RÉPARTITION LOGISTIQUE DES FLUX :\n` +
        `- Volume total expédié : ${totalShipments} colis\n` +
        `- Taux de livraison global : ${deliveryRate}%\n` +
        `- Taux de retour / refus : ${totalShipments > 0 ? Math.round((returnedShipments / totalShipments) * 100) : 0}%\n\n` +
        `TRANSPORTEURS CONFIGURÉS :\n` +
        `- Yalidine Fast Logistics (Intégration API V1 Active)\n` +
        `- Guepex Express, EcoTrack, ZR Express, Maystro Delivery\n\n` +
        `RECOMMANDATIONS LOGISTIQUES :\n` +
        `- Favoriser le mode Stop Desk dans les wilayas éloignées pour diminuer le taux d'échec.\n` +
        `- Contrôler les bordereaux thermiques A6 avant remise aux livreurs.`;
      break;

    case 'profitability':
      title = `DzMahall · Analyse de Rentabilité COD Algérie (${dateStr})`;
      content = `DZMAHALL — RAPPORT DE RENTABILITÉ COD & GESTION DES RISQUES\n` +
        `Date d'émission : ${new Date().toLocaleString('fr-FR')}\n\n` +
        `MÉTRIQUES FINANCIÈRES ALGÉRIE :\n` +
        `- Chiffre d'affaires total : ${totalRevenue.toLocaleString()} DZD\n` +
        `- Taux de livraison actuel : ${deliveryRate}%\n` +
        `- Seuil de rentabilité minimum (Break-even delivery rate) : 72%\n\n` +
        `IMPACT DES RETOURS :\n` +
        `- Frais d'expédition aller et retour absorbés sur colis refusés.\n` +
        `- Filtre anti-fraude préventif actif sur les numéros suspects.`;
      break;

    default:
      title = `DzMahall · Rapport d'Activité E-Commerce (${dateStr})`;
      content = `DZMAHALL — RAPPORT D'ACTIVITÉ GÉNÉRAL\n` +
        `Date : ${new Date().toLocaleString('fr-FR')}\n` +
        `Total commandes : ${totalOrders} · Chiffre d'affaires : ${totalRevenue.toLocaleString()} DZD\n`;
  }

  // 1. Création du document vierge
  const createRes = await fetch('https://docs.googleapis.com/v1/documents', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title })
  });

  if (!createRes.ok) {
    const err = await createRes.json();
    throw new Error(err.error?.message || 'Erreur lors de la création du document Google Docs.');
  }

  const docData = await createRes.json();
  const documentId = docData.documentId;

  // 2. Insertion du texte formaté via batchUpdate
  await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      requests: [
        {
          insertText: {
            location: { index: 1 },
            text: content
          }
        }
      ]
    })
  });

  return {
    documentId,
    documentUrl: `https://docs.google.com/document/d/${documentId}/edit`,
    title
  };
};

// ==============================================================
// 6. GOOGLE CALENDAR : ÉVÉNEMENTS & RAPPELS COD
// ==============================================================

export interface CalendarEventPayload {
  summary: string;
  description: string;
  startDateTime: string; // ISO 8601
  endDateTime: string;   // ISO 8601
  location?: string;
}

/**
 * Crée un événement dans le calendrier Google principal
 */
export const createCalendarReminder = async (
  token: string,
  event: CalendarEventPayload
): Promise<{ eventId: string; eventUrl: string }> => {
  const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      summary: event.summary,
      description: event.description,
      location: event.location || 'Algérie',
      start: {
        dateTime: event.startDateTime,
        timeZone: 'Africa/Algiers'
      },
      end: {
        dateTime: event.endDateTime,
        timeZone: 'Africa/Algiers'
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 15 },
          { method: 'email', minutes: 60 }
        ]
      }
    })
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Erreur lors de la création du rappel Google Calendar.');
  }

  const data = await res.json();
  return {
    eventId: data.id,
    eventUrl: data.htmlLink
  };
};

/**
 * Création rapide d'un rappel d'appel téléphonique de confirmation client
 */
export const createOrderConfirmationCallEvent = async (
  token: string,
  order: DzMahallOrder
) => {
  const now = new Date();
  const startTime = new Date(now.getTime() + 30 * 60 * 1000); // dans 30 min
  const endTime = new Date(startTime.getTime() + 20 * 60 * 1000); // durée 20 min

  return createCalendarReminder(token, {
    summary: `📞 [DzMahall] Confirmer Commande ${order.orderNumber} - ${order.customerName}`,
    description: `Appeler le client pour valider la commande COD avant envoi transporteur.\n` +
      `Client : ${order.customerName}\n` +
      `Téléphone : ${order.customerPhone}\n` +
      `Wilaya : ${order.wilayaCode} - ${order.wilayaName} (${order.commune})\n` +
      `Total à encaisser : ${order.totalDzd.toLocaleString()} DZD\n` +
      `Mode : ${order.deliveryMode === 'stop_desk' ? 'Retrait Stop Desk' : 'Domicile'}`,
    startDateTime: startTime.toISOString(),
    endDateTime: endTime.toISOString(),
    location: `${order.commune}, ${order.wilayaName}, Algérie`
  });
};
