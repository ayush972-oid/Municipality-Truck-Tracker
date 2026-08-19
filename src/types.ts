export type VehicleType = 
  | 'general_waste'
  | 'recyclables'
  | 'organic_compost'
  | 'bulky_waste'
  | 'street_sweeper';

export type TruckStatus = 
  | 'collecting'
  | 'en_route'
  | 'compacting'
  | 'unloading_depot'
  | 'delayed'
  | 'idle';

export type StreetCoverageStatus = 'pending' | 'in_progress' | 'completed' | 'delayed';

export interface Coordinates {
  x: number; // Normalized coordinate in map SVG view (0 - 1000)
  y: number; // Normalized coordinate in map SVG view (0 - 700)
  lat?: number;
  lng?: number;
}

export interface Waypoint extends Coordinates {
  streetName: string;
  isStop?: boolean;
  stopDurationSeconds?: number;
  householdsCount?: number;
}

export interface Truck {
  id: string;
  code: string;
  name: string;
  driver: string;
  driverPhone: string;
  vehicleType: VehicleType;
  status: TruckStatus;
  currentZoneId: string;
  zoneName: string;
  speedKmh: number;
  fuelLevelPercent: number;
  batteryLevelPercent?: number;
  capacityTons: number;
  currentLoadTons: number;
  loadPercent: number;
  position: Coordinates;
  headingAngle: number;
  currentWaypointIndex: number;
  route: Waypoint[];
  currentStreet: string;
  nextStreet: string;
  stopsCompleted: number;
  totalStops: number;
  distanceCoveredKm: number;
  shiftStartTime: string;
  estimatedZoneFinishTime: string;
  activeAlert?: string;
  delayedByMinutes?: number;
}

export interface StreetSegment {
  id: string;
  name: string;
  zoneId: string;
  path: Coordinates[];
  status: StreetCoverageStatus;
  households: number;
  binsCollected: number;
  scheduledTimeWindow: string;
  lastVisitedTimestamp?: string;
  assignedTruckId: string;
}

export interface Zone {
  id: string;
  name: string;
  code: string;
  color: string;
  fillColor: string;
  polygon: Coordinates[];
  center: Coordinates;
  totalStreets: number;
  completedStreets: number;
  inProgressStreets: number;
  pendingStreets: number;
  completionPercent: number;
  assignedTruckIds: string[];
  wasteTypeToday: string;
  populationServed: number;
  collectionWindow: string;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  hotspots?: string[];
}

export interface ResidentSubscription {
  address: string;
  streetName: string;
  zoneId: string;
  notificationChannels: ('sms' | 'push' | 'email')[];
  leadTimeMinutes: number; // e.g. 5, 10, 15, 30
  phone?: string;
  email?: string;
  soundAlertEnabled: boolean;
  active: boolean;
}

export interface NotificationLog {
  id: string;
  timestamp: string;
  channel: 'sms' | 'push' | 'email' | 'system';
  targetZone: string;
  title: string;
  body: string;
  status: 'delivered' | 'scheduled' | 'simulated';
  priority: 'normal' | 'urgent' | 'alert';
}

export interface MissedPickupTicket {
  id: string;
  address: string;
  zoneId: string;
  residentName: string;
  phone: string;
  wasteType: VehicleType;
  description: string;
  photoMock?: string;
  createdAt: string;
  status: 'submitted' | 'dispatched' | 're_scheduled' | 'collected';
  dispatchedTruckId?: string;
  resolutionNote?: string;
}

export interface CityCoverageSummary {
  cityCompletionPercent: number;
  totalStreets: number;
  completedStreets: number;
  inProgressStreets: number;
  totalTonnageCollected: number;
  activeFleetCount: number;
  totalDistanceTraversedKm: number;
  onTimeRatePercent: number;
  estimatedCityFinishTime: string;
  co2SavedKg: number;
}

export interface RouteOptimizationRecommendation {
  action: string;
  targetTruck: string;
  expectedTimeSavedMinutes: number;
  fuelSavedLiters: number;
  reasoning: string;
}

export interface RouteOptimizationReport {
  efficiencyScore: number;
  summary: string;
  bottlenecks: Array<{
    zone: string;
    issue: string;
    impact: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  recommendations: RouteOptimizationRecommendation[];
  dynamicRerouteSuggestions: Array<{
    truckId: string;
    currentZone: string;
    suggestedZone: string;
    priorityStreets: string[];
  }>;
  estimatedCityCompletion: string;
}

export interface ResidentBroadcast {
  smsText: string;
  pushTitle: string;
  pushBody: string;
  emailSubject: string;
  emailHtmlSnippet: string;
  recommendedAction: string;
}
