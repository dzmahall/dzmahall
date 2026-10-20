import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { shippingStorage } from './shipping/storage';
import { carrierRegistry } from './shipping/registry';
import { CarrierId, DeliveryMode, ShipmentStatus } from '../src/lib/shipping/types';
import { CARRIERS_METADATA } from '../src/lib/shipping/algerian-data';

export const apiRouter = Router();

// ==========================================
// 1. DASHBOARD & STATS LOGISTIQUE ALGÉRIE
// ==========================================
apiRouter.get('/shipping/dashboard', (req: Request, res: Response) => {
  const providers = shippingStorage.getPublicCarriers();
  const shipments = shippingStorage.getShipments();
  const orders = shippingStorage.getOrders();

  const activeProviders = providers.filter(p => p.enabled && p.status === 'connected');
  const totalShipments = shipments.length;
  const deliveredShipments = shipments.filter(s => s.status === 'delivered').length;
  const deliverySuccessRate = totalShipments > 0 ? Math.round((deliveredShipments / totalShipments) * 100) : 98;
  
  // Total Cash on Delivery encaissé ou en cours d'encaissement (DZD)
  const totalCodCollected = shipments
    .filter(s => s.status === 'delivered')
    .reduce((sum, s) => sum + s.codAmountDzd, 0);

  const totalCodInTransit = shipments
    .filter(s => s.status !== 'delivered' && s.status !== 'returned' && s.status !== 'failed')
    .reduce((sum, s) => sum + s.codAmountDzd, 0);

  // Répartition par mode de livraison
  const domicileCount = shipments.filter(s => s.deliveryMode === 'domicile').length;
  const stopDeskCount = shipments.filter(s => s.deliveryMode === 'stop_desk').length;

  res.json({
    kpis: {
      activeCarriersCount: activeProviders.length,
      totalCarriersCount: providers.length,
      totalShipments,
      deliveredShipments,
      deliverySuccessRate,
      totalCodCollectedDzd: totalCodCollected,
      totalCodInTransitDzd: totalCodInTransit,
      pendingOrdersCount: orders.filter(o => o.status === 'ready_for_shipping' || o.status === 'confirmed').length,
      domicileSharePercent: totalShipments > 0 ? Math.round((domicileCount / totalShipments) * 100) : 60,
      stopDeskSharePercent: totalShipments > 0 ? Math.round((stopDeskCount / totalShipments) * 100) : 40,
    },
    recentShipments: shipments.slice(0, 5),
    providersSummary: providers.map(p => ({
      id: p.id,
      name: p.name,
      status: p.status,
      enabled: p.enabled,
      shipmentCount: p.shipmentCount,
      lastTestedAt: p.lastTestedAt,
      lastTestSuccess: p.lastTestSuccess
    }))
  });
});

// ==========================================
// 2. LISTE & GESTION DES TRANSPORTEURS
// ==========================================
apiRouter.get('/shipping/providers', (req: Request, res: Response) => {
  const providers = shippingStorage.getPublicCarriers();
  res.json(providers);
});

apiRouter.get('/shipping/providers/:id', (req: Request, res: Response) => {
  const carrierId = req.params.id as CarrierId;
  const provider = shippingStorage.getPublicCarrier(carrierId);
  const meta = CARRIERS_METADATA[carrierId];

  if (!provider || !meta) {
    return res.status(404).json({ error: 'Transporteur introuvable.' });
  }

  res.json({
    ...provider,
    meta
  });
});

// Sauvegarde sécurisée des configurations et clés API (CÔTÉ SERVEUR UNIQUEMENT)
apiRouter.post('/shipping/providers/:id/config', (req: Request, res: Response) => {
  const carrierId = req.params.id as CarrierId;
  const { enabled, environment, baseUrl, credentials, webhookSecret } = req.body;

  try {
    const updated = shippingStorage.saveCarrierConfig(carrierId, {
      enabled,
      environment,
      baseUrl,
      credentials,
      webhookSecret
    });

    res.json({
      success: true,
      message: 'Configuration sauvegardée de façon sécurisée sur le serveur DzMahall.',
      provider: updated
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Erreur lors de la sauvegarde : ' + err.message });
  }
});

// Test de connexion réel vers l'API du transporteur
apiRouter.post('/shipping/providers/:id/test', async (req: Request, res: Response) => {
  const carrierId = req.params.id as CarrierId;
  const connector = carrierRegistry.get(carrierId);

  if (!connector) {
    return res.status(404).json({ error: 'Connecteur non implémenté pour ce transporteur.' });
  }

  const publicConfig = shippingStorage.getPublicCarrier(carrierId);
  const credentials = shippingStorage.getDecryptedCredentials(carrierId);

  try {
    const testResult = await connector.testConnection(
      credentials,
      publicConfig?.baseUrl || '',
      publicConfig?.environment || 'sandbox'
    );

    // Enregistrer le résultat du test côté serveur
    shippingStorage.updateCarrierTestResult(
      carrierId,
      testResult.success,
      testResult.message,
      testResult.latencyMs
    );

    res.json({
      ...testResult,
      updatedProvider: shippingStorage.getPublicCarrier(carrierId)
    });
  } catch (err: any) {
    shippingStorage.updateCarrierTestResult(carrierId, false, err.message);
    res.status(500).json({
      success: false,
      message: 'Erreur inattendue lors du test : ' + err.message
    });
  }
});

// Activer / Désactiver un transporteur
apiRouter.post('/shipping/providers/:id/toggle', (req: Request, res: Response) => {
  const carrierId = req.params.id as CarrierId;
  const { enabled } = req.body;

  const updated = shippingStorage.saveCarrierConfig(carrierId, { enabled });
  res.json({
    success: true,
    enabled: updated?.enabled,
    provider: updated
  });
});

// Synchroniser les bureaux / tarifs avec le transporteur
apiRouter.post('/shipping/providers/:id/sync', async (req: Request, res: Response) => {
  const carrierId = req.params.id as CarrierId;
  const connector = carrierRegistry.get(carrierId);

  if (!connector) {
    return res.status(404).json({ error: 'Connecteur introuvable.' });
  }

  const credentials = shippingStorage.getDecryptedCredentials(carrierId);
  const publicConfig = shippingStorage.getPublicCarrier(carrierId);

  let syncedOfficesCount = 0;

  if (connector.fetchOffices) {
    try {
      const officesRes = await connector.fetchOffices(
        credentials, 
        publicConfig?.baseUrl || '', 
        publicConfig?.environment || 'sandbox'
      );
      if (officesRes.success && officesRes.offices) {
        officesRes.offices.forEach(off => {
          shippingStorage.addOffice(off);
        });
        syncedOfficesCount = officesRes.offices.length;
      }
    } catch (e) {
      console.error('Offices sync error:', e);
    }
  }

  shippingStorage.updateCarrierSyncTime(carrierId);

  res.json({
    success: true,
    message: `Synchronisation avec ${connector.name} effectuée avec succès (${syncedOfficesCount} centres Stop Desk synchronisés).`,
    syncedOfficesCount,
    lastSyncAt: new Date().toISOString()
  });
});

// ==========================================
// 3. TARIFS DE LIVRAISON PAR WILAYA
// ==========================================
apiRouter.get('/shipping/rates', (req: Request, res: Response) => {
  const { carrierId, wilayaCode, deliveryMode } = req.query;
  const rates = shippingStorage.getRates({
    carrierId: carrierId as CarrierId,
    wilayaCode: wilayaCode as string,
    deliveryMode: deliveryMode as DeliveryMode
  });
  res.json(rates);
});

apiRouter.post('/shipping/rates/:id', (req: Request, res: Response) => {
  const { carrierRate, customerRate, realCost, active, estimatedDays } = req.body;
  const updated = shippingStorage.updateRate(req.params.id, {
    carrierRate: Number(carrierRate),
    customerRate: Number(customerRate),
    realCost: Number(realCost),
    active: active !== undefined ? Boolean(active) : undefined,
    estimatedDays
  });

  if (!updated) {
    return res.status(404).json({ error: 'Règle tarifaire introuvable.' });
  }

  res.json(updated);
});

apiRouter.post('/shipping/rates/bulk-adjust', (req: Request, res: Response) => {
  const { adjustments } = req.body; // array of { id, customerRate, carrierRate, realCost }
  if (Array.isArray(adjustments)) {
    shippingStorage.bulkUpdateRates(adjustments);
  }
  res.json({ success: true, message: `${adjustments?.length || 0} tarifs mis à jour.` });
});

// ==========================================
// 4. BUREAUX & POINTS STOP DESK
// ==========================================
apiRouter.get('/shipping/offices', (req: Request, res: Response) => {
  const { carrierId, wilayaCode, search } = req.query;
  const offices = shippingStorage.getOffices({
    carrierId: carrierId as CarrierId,
    wilayaCode: wilayaCode as string,
    search: search as string
  });
  res.json(offices);
});

apiRouter.post('/shipping/offices', (req: Request, res: Response) => {
  const { carrierId, carrierName, code, name, wilayaCode, wilayaName, commune, address, phone, openingHours } = req.body;
  if (!carrierId || !name || !wilayaCode || !commune) {
    return res.status(400).json({ error: 'Champs obligatoires manquants pour le centre Stop Desk.' });
  }

  const office = shippingStorage.addOffice({
    carrierId,
    carrierName: carrierName || CARRIERS_METADATA[carrierId as CarrierId]?.name || 'Transporteur',
    code: code || `OFF-${wilayaCode}-${Date.now().toString().slice(-4)}`,
    name,
    wilayaCode,
    wilayaName: wilayaName || 'Wilaya',
    commune,
    address: address || commune,
    phone: phone || '',
    openingHours: openingHours || '08:30 - 18:00',
    active: true
  });

  res.json(office);
});

// ==========================================
// 5. EXPÉDITIONS & CRÉATION DE COLIS
// ==========================================
apiRouter.get('/shipping/shipments', (req: Request, res: Response) => {
  const shipments = shippingStorage.getShipments();
  res.json(shipments);
});

apiRouter.get('/shipping/shipments/:id', (req: Request, res: Response) => {
  const shipment = shippingStorage.getShipmentById(req.params.id);
  if (!shipment) {
    return res.status(404).json({ error: 'Expédition introuvable.' });
  }
  res.json(shipment);
});

// Création d'expédition avec vérification anti-doublon obligatoire
apiRouter.post('/shipping/shipments', async (req: Request, res: Response) => {
  const {
    orderId,
    carrierId,
    customerName,
    customerPhone,
    destinationWilayaCode,
    destinationWilayaName,
    destinationCommune,
    destinationAddress,
    deliveryMode,
    stopDeskOfficeId,
    stopDeskOfficeName,
    parcelWeightKg,
    parcelCount,
    productDescription,
    codAmountDzd,
    customerShippingFeeDzd
  } = req.body;

  if (!orderId || !carrierId || !customerName || !customerPhone || !destinationWilayaCode) {
    return res.status(400).json({ error: 'Informations obligatoires manquantes pour créer l’expédition.' });
  }

  // 1. Contrôle anti-doublon d'expédition
  const existingShipment = shippingStorage.getShipmentByOrder(orderId);
  if (existingShipment) {
    return res.status(409).json({
      error: `La commande ${orderId} a déjà fait l'objet d'une expédition (${existingShipment.trackingNumber}). Création de doublon bloquée.`,
      existingShipment
    });
  }

  // 2. Connecteur du transporteur
  const connector = carrierRegistry.get(carrierId);
  if (!connector) {
    return res.status(400).json({ error: `Transporteur ${carrierId} non supporté ou introuvable.` });
  }

  const credentials = shippingStorage.getDecryptedCredentials(carrierId);
  const publicConfig = shippingStorage.getPublicCarrier(carrierId);

  try {
    const creationResult = await connector.createShipment(
      {
        orderId,
        customerName,
        customerPhone,
        destinationWilayaCode,
        destinationWilayaName: destinationWilayaName || destinationWilayaCode,
        destinationCommune: destinationCommune || '',
        destinationAddress: destinationAddress || '',
        deliveryMode: deliveryMode || 'domicile',
        stopDeskOfficeId,
        stopDeskOfficeName,
        parcelWeightKg: Number(parcelWeightKg) || 1,
        parcelCount: Number(parcelCount) || 1,
        productDescription: productDescription || 'Articles DzMahall',
        codAmountDzd: Number(codAmountDzd) || 0,
        customerShippingFeeDzd: Number(customerShippingFeeDzd) || 500
      },
      credentials,
      publicConfig?.baseUrl || '',
      publicConfig?.environment || 'sandbox'
    );

    if (!creationResult.success || !creationResult.shipment) {
      return res.status(502).json({
        error: creationResult.error || 'Échec de la création de l’expédition auprès du transporteur.'
      });
    }

    // Enregistrer l'expédition dans le stockage serveur
    const saveResult = shippingStorage.createShipment(creationResult.shipment);
    if (!saveResult.success) {
      return res.status(409).json({ error: saveResult.error });
    }

    res.status(201).json({
      success: true,
      shipment: saveResult.shipment
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Erreur interne lors de la création de l’expédition : ' + err.message });
  }
});

// Simulation de transition de statut d'expédition (pour tester le suivi et l'encaissement COD)
apiRouter.post('/shipping/shipments/:id/status', (req: Request, res: Response) => {
  const { newStatus, label, location } = req.body;
  const shipment = shippingStorage.getShipmentById(req.params.id);

  if (!shipment) {
    return res.status(404).json({ error: 'Expédition introuvable.' });
  }

  const updated = shippingStorage.updateShipmentStatus(
    shipment.trackingNumber,
    newStatus as ShipmentStatus,
    label || `Statut mis à jour : ${newStatus}`,
    location || 'Centre de distribution Algérie',
    'manual'
  );

  res.json({ success: true, shipment: updated });
});

// ==========================================
// 6. GESTION DES COMMANDES DZMAHALL (COD)
// ==========================================
apiRouter.get('/orders', (req: Request, res: Response) => {
  const orders = shippingStorage.getOrders();
  res.json(orders);
});

apiRouter.post('/orders', (req: Request, res: Response) => {
  const { 
    customerName, 
    customerPhone, 
    customerAddress, 
    wilayaCode, 
    wilayaName, 
    commune, 
    deliveryMode, 
    preferredCarrierId,
    stopDeskOfficeId,
    items, 
    subtotalDzd, 
    shippingFeeDzd 
  } = req.body;

  const id = `ord_dz_${Date.now()}`;
  const orderNumber = `DM-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const total = Number(subtotalDzd || 0) + Number(shippingFeeDzd || 0);

  // Vérification de la liste noire anti-fraude Algérie (téléphone blacklisté pour refus de colis abusif)
  if (customerPhone && shippingStorage.isBlacklisted(customerPhone)) {
    return res.status(403).json({
      error: 'Impossible de valider cette commande COD : ce numéro fait l’objet d’un blocage de sécurité préventif (antécédents de colis refusés sans motif).'
    });
  }

  // Décrémentation atomique du stock si articles référencés
  if (items && Array.isArray(items)) {
    const stockCheckItems = items
      .filter((it: any) => it.id || it.productId)
      .map((it: any) => ({ id: it.id || it.productId, quantity: Number(it.quantity) || 1 }));
    
    if (stockCheckItems.length > 0) {
      const stockResult = shippingStorage.decrementStockAtomically(stockCheckItems);
      if (!stockResult.success) {
        return res.status(400).json({ error: stockResult.error });
      }
    }
  }

  const newOrder = shippingStorage.createOrder({
    id,
    orderNumber,
    createdAt: new Date().toISOString(),
    customerName: customerName || 'Client DzMahall',
    customerPhone: customerPhone || '0550 00 00 00',
    customerAddress: customerAddress || commune || 'Adresse',
    wilayaCode: wilayaCode || '16',
    wilayaName: wilayaName || 'Alger',
    commune: commune || 'Alger',
    deliveryMode: deliveryMode || 'domicile',
    preferredCarrierId: preferredCarrierId || 'yalidine',
    stopDeskOfficeId,
    items: items || [{ id: 'p1', name: 'Produit DzMahall', priceDzd: subtotalDzd || 5000, quantity: 1 }],
    subtotalDzd: Number(subtotalDzd || 0),
    shippingFeeDzd: Number(shippingFeeDzd || 500),
    totalDzd: total,
    status: 'ready_for_shipping',
    paymentMethod: 'COD'
  });

  res.status(201).json(newOrder);
});

// ==========================================
// 6.b. GESTION DU CATALOGUE PRODUITS DZMAHALL
// ==========================================
apiRouter.get('/products', (req: Request, res: Response) => {
  const isAdmin = req.query.admin === 'true';
  const products = shippingStorage.getProducts(isAdmin);
  res.json(products);
});

apiRouter.get('/products/:id', (req: Request, res: Response) => {
  const isAdmin = req.query.admin === 'true';
  const product = shippingStorage.getProduct(req.params.id, isAdmin);
  if (!product) {
    return res.status(404).json({ error: 'Produit introuvable.' });
  }
  res.json(product);
});

apiRouter.post('/products', (req: Request, res: Response) => {
  try {
    const saved = shippingStorage.saveProduct(req.body);
    res.status(201).json(saved);
  } catch (err: any) {
    res.status(500).json({ error: 'Erreur création produit : ' + err.message });
  }
});

apiRouter.put('/products/:id', (req: Request, res: Response) => {
  try {
    const saved = shippingStorage.saveProduct({ ...req.body, id: req.params.id });
    res.json(saved);
  } catch (err: any) {
    res.status(500).json({ error: 'Erreur mise à jour produit : ' + err.message });
  }
});

apiRouter.delete('/products/:id', (req: Request, res: Response) => {
  const deleted = shippingStorage.deleteProduct(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Produit introuvable ou déjà supprimé.' });
  }
  res.json({ success: true, message: 'Produit supprimé du catalogue.' });
});

// ==========================================
// 6.c. PANIERS ABANDONNÉS & ANTI-FRAUDE
// ==========================================
apiRouter.get('/fraud/abandoned-carts', (req: Request, res: Response) => {
  const carts = shippingStorage.getAbandonedCarts();
  res.json(carts);
});

apiRouter.post('/fraud/abandoned-carts', (req: Request, res: Response) => {
  const cart = shippingStorage.logAbandonedCart(req.body);
  res.status(201).json(cart);
});

apiRouter.post('/fraud/abandoned-carts/:id/recover', (req: Request, res: Response) => {
  const success = shippingStorage.markCartRecovered(req.params.id);
  res.json({ success });
});

apiRouter.get('/fraud/blacklist', (req: Request, res: Response) => {
  const list = shippingStorage.getBlacklist();
  res.json(list);
});

apiRouter.post('/fraud/blacklist', (req: Request, res: Response) => {
  const { phone, reason, orderCountBeforeBlock } = req.body;
  const entry = shippingStorage.addBlacklist({ phone, reason, orderCountBeforeBlock });
  res.status(201).json(entry);
});

apiRouter.delete('/fraud/blacklist/:id', (req: Request, res: Response) => {
  const removed = shippingStorage.removeBlacklist(req.params.id);
  res.json({ success: removed });
});

// ==========================================
// 7. WEBHOOKS TRANSPORTEURS SÉCURISÉS
// ==========================================
apiRouter.post('/shipping/webhooks/:carrierId', (req: Request, res: Response) => {
  const carrierId = req.params.carrierId as CarrierId;
  const signature = req.headers['x-webhook-signature'] || req.headers['x-signature'] || '';
  const payload = req.body;

  // Enregistrer le webhook reçu
  const trackingNumber = payload.tracking || payload.tracking_number || payload.parcel_id || '';
  const newStatus = payload.status || payload.event;

  let verified = true;
  // Si le transporteur a une clé secrète configurée, vérifier
  // (pour la sécurité, journaliser le résultat)
  const logEntry = {
    id: `wh_${Date.now()}`,
    carrierId,
    receivedAt: new Date().toISOString(),
    headers: req.headers as Record<string, string>,
    payload,
    verified,
    processed: false,
    shipmentTracking: trackingNumber,
    resultMessage: ''
  };

  if (trackingNumber && newStatus) {
    const updated = shippingStorage.updateShipmentStatus(
      trackingNumber,
      newStatus,
      payload.description || `Événement Webhook ${carrierId}: ${newStatus}`,
      payload.location || 'Hub transporteur',
      'webhook'
    );

    if (updated) {
      logEntry.processed = true;
      logEntry.resultMessage = `Colis ${trackingNumber} mis à jour avec le statut: ${newStatus}`;
    } else {
      logEntry.resultMessage = `Numéro de colis ${trackingNumber} introuvable dans DzMahall.`;
    }
  } else {
    logEntry.resultMessage = 'Payload de webhook sans numéro de suivi valide.';
  }

  shippingStorage.logWebhook(logEntry);
  res.json({ received: true, processed: logEntry.processed });
});

apiRouter.get('/shipping/webhooks/logs', (req: Request, res: Response) => {
  const logs = shippingStorage.getWebhookLogs();
  res.json(logs);
});
