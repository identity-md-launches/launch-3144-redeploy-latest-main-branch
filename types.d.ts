interface WheelReading {
  active: boolean;
  rpm: number;
  distance: number;
  work: number;
  anchor: number;
  projected: number;
}
interface SettlementReceipt {
  transactionHash: string;
  logIndex: string | number;
  confirmationStatus: string;
  settledThroughRound: string | number;
  completedBlockCount: string | number;
  workAdded: string | number;
  blockHeight: string | number;
  blockTimestamp: string;
}
interface SettlementEvent {
  simulated: boolean;
  blocks: number;
  rows: SettlementReceipt[];
}
interface SqueekFeedAPI extends EventTarget {
  live: boolean;
  reason: string;
  wheel: WheelReading;
  realDistance: number;
  source: string;
  status: {
    measurement: {
      cumulativeWorkUnits: string | number;
      coreStatus: string;
      rpmMilli: string | number;
      distanceMm: string | number;
      observedAt: string;
      freshness: string;
      staleAfterSeconds: string | number;
    };
    builder: { anchor: { blockHeight: string | number }; projected?: { blockHeight: string | number } };
  } | null;
  economy: { supply?: { liveSupplyBaseUnits?: string }; asset?: { symbol: string } } | null;
  settlements: SettlementReceipt[];
  poll(): Promise<void>;
  snapshot(): unknown;
}
interface Window {
  squeekFeed: SqueekFeedAPI;
  webkitAudioContext?: typeof AudioContext;
}
