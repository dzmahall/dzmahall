import { CarrierId } from '../../src/lib/shipping/types';
import { CARRIERS_METADATA } from '../../src/lib/shipping/algerian-data';
import { CarrierConnector } from './connectors/base';
import { YalidineConnector } from './connectors/yalidine';
import { 
  GuepexConnector, 
  EcoTrackConnector, 
  ZrExpressConnector, 
  GenericCarrierConnector 
} from './connectors/other-carriers';

class CarrierRegistry {
  private connectors: Map<CarrierId, CarrierConnector> = new Map();

  constructor() {
    // 1. Premier transporteur documenté prioritaire : Yalidine
    this.register(new YalidineConnector());

    // 2. Transporteurs majeurs algériens
    this.register(new GuepexConnector());
    this.register(new EcoTrackConnector());
    this.register(new ZrExpressConnector());

    // 3. Connecteurs configurables selon la liste demandée
    const extraCarriers: CarrierId[] = ['maystro', 'noest', 'anderson', 'dhd', 'custom'];
    for (const cId of extraCarriers) {
      const meta = CARRIERS_METADATA[cId];
      if (meta) {
        this.register(new GenericCarrierConnector(cId, meta.name));
      }
    }
  }

  public register(connector: CarrierConnector) {
    this.connectors.set(connector.id, connector);
  }

  public get(id: CarrierId): CarrierConnector | undefined {
    return this.connectors.get(id);
  }

  public getAll(): CarrierConnector[] {
    return Array.from(this.connectors.values());
  }
}

export const carrierRegistry = new CarrierRegistry();
