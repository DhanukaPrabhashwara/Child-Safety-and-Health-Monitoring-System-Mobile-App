export interface HealthData {
  heartRate: number;
  spO2: number;
  bloodPressure: string;
  temperature: number;
  lastUpdated: string;
  hydrationLevel: number; // 0-100%
  stressLevel: number; // 0-100
  hydrationHistory: number[]; // Last 7 days or hours
  heartRateHistory: number[]; // Recent readings
  stressHistory: string[]; // Recent readings (Low, Moderate, High)
}

export interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  timestamp?: string;
  status?: 'Arrived' | 'En Route' | 'Left' | 'Unknown';
}

export interface Alert {
  id: string;
  type: 'Health' | 'Location' | 'Safety';
  message: string;
  severity: 'Low' | 'Medium' | 'Critical';
  timestamp: string;
}

// NEW: Audio Privacy & Trust Data
export interface AudioEvent {
  time: string;
  label: string; // e.g. "Trusted Voice", "Scream", "Crying"
  type: 'safe' | 'warning' | 'danger';
}

export interface PrivacyLog {
  timestamp: string;
  label: string;
  confidence: number;
}

export interface TrustedVoice {
  id: string;
  name: string;
  relation: string;
  avatarUrl?: string; // Optional URL
  initials: string;
  embedding?: number[]; // 128-float vector
  samplesCount?: number;
}

export interface Child {
  id: string;
  name: string;
  age: number;
  gender: string;
  bloodGroup: string;
  photoUrl: string;
  location: LocationData;
  locationHistory: LocationData[];
  safeZones: string[];
  healthData: HealthData;
  alerts?: Alert[];

  // NEW: Audio Threat Detection Data
  audioStatus: 'safe' | 'unknown' | 'distress';
  audioEvents: AudioEvent[];
  riskScore: number; // 0-100%
  riskHistory: number[]; // For the graph
  trustedVoices: TrustedVoice[];
  privacyLogs: PrivacyLog[];
}

export const MOCK_CHILDREN: Child[] = [
  {
    id: '1',
    name: 'Emma Johnson',
    age: 8,
    gender: 'Female',
    bloodGroup: 'A+',
    photoUrl: 'https://ui-avatars.com/api/?name=Emma+Johnson&background=FFB6C1&color=fff&size=256',
    location: {
      latitude: 40.7128,
      longitude: -74.0060,
      address: 'Central Park Primary School, NY',
      status: 'Arrived'
    },
    locationHistory: [
      { latitude: 40.7128, longitude: -74.0060, address: 'School', timestamp: '08:30 AM', status: 'Arrived' },
      { latitude: 40.7120, longitude: -74.0050, address: 'Home', timestamp: '07:45 AM', status: 'Left' }
    ],
    safeZones: ['School', 'Home', 'Park'],
    healthData: {
      heartRate: 85,
      spO2: 98,
      bloodPressure: '110/70',
      temperature: 36.6,
      lastUpdated: '10 mins ago',
      hydrationLevel: 80, // Good
      stressLevel: 20, // Low
      hydrationHistory: [60, 70, 80, 50, 90, 85, 80],
      heartRateHistory: [80, 85, 90, 82, 78, 85],
      stressHistory: ['Low', 'Low', 'Moderate', 'Low', 'Low', 'Low']
    },
    alerts: [],
    // Audio Data - SAFE
    audioStatus: 'safe',
    riskScore: 15,
    riskHistory: [10, 12, 15, 14, 15, 15],
    audioEvents: [
      { time: '10:00 AM', label: 'Trusted Voice', type: 'safe' },
      { time: '10:15 AM', label: 'Silence', type: 'safe' },
      { time: '10:30 AM', label: 'Laughter', type: 'safe' }
    ],
    trustedVoices: [
      { id: 'v1', name: 'Mom', relation: 'Mother', initials: 'MJ' },
      { id: 'v2', name: 'Dad', relation: 'Father', initials: 'DJ' },
      { id: 'cloud', name: 'Watch (Cloud)', relation: 'Device Sync', initials: 'WC' }
    ],
    privacyLogs: [
      { timestamp: '10:00 AM', label: 'Trusted Voice (Mom)', confidence: 98 },
      { timestamp: '09:45 AM', label: 'Silence', confidence: 99 }
    ]
  },
  {
    id: '2',
    name: 'Noah Williams',
    age: 6,
    gender: 'Male',
    bloodGroup: 'O+',
    photoUrl: 'https://ui-avatars.com/api/?name=Noah+Williams&background=87CEEB&color=fff&size=256',
    location: {
      latitude: 34.0522,
      longitude: -118.2437,
      address: 'Sunshine Daycare, LA',
      status: 'En Route'
    },
    locationHistory: [
      { latitude: 34.0522, longitude: -118.2437, address: 'Main St', timestamp: '09:00 AM', status: 'En Route' }
    ],
    safeZones: ['Daycare', 'Home'],
    healthData: {
      heartRate: 92,
      spO2: 99,
      bloodPressure: '105/68',
      temperature: 36.8,
      lastUpdated: '5 mins ago',
      hydrationLevel: 30, // Low - ALERT
      stressLevel: 45, // Medium
      hydrationHistory: [40, 35, 30, 20, 25, 30, 30],
      heartRateHistory: [88, 90, 92, 95, 92, 90],
      stressHistory: ['Moderate', 'Moderate', 'High', 'Moderate', 'Moderate', 'Low']
    },
    alerts: [
      {
        id: 'a1',
        type: 'Health',
        message: 'Low Hydration Level',
        severity: 'Medium',
        timestamp: '10 mins ago'
      }
    ],
    // Audio Data - UNKNOWN VOICE
    audioStatus: 'unknown',
    riskScore: 65,
    riskHistory: [20, 30, 45, 60, 65, 65],
    audioEvents: [
      { time: '11:00 AM', label: 'Unknown Voice', type: 'warning' },
      { time: '10:55 AM', label: 'Silence', type: 'safe' }
    ],
    trustedVoices: [
      { id: 'v1', name: 'Mom', relation: 'Mother', initials: 'MW' }
    ],
    privacyLogs: [
      { timestamp: '11:00 AM', label: 'Unknown Voice', confidence: 88 },
      { timestamp: '10:55 AM', label: 'Silence', confidence: 95 }
    ]
  },
  {
    id: '3',
    name: 'Olivia Brown',
    age: 10,
    gender: 'Female',
    bloodGroup: 'B-',
    photoUrl: 'https://ui-avatars.com/api/?name=Olivia+Brown&background=DDA0DD&color=fff&size=256',
    location: {
      latitude: 51.5074,
      longitude: -0.1278,
      address: 'Unknown Location',
      status: 'Unknown'
    },
    locationHistory: [],
    safeZones: ['School', 'Home'],
    healthData: {
      heartRate: 110, // High - ALERT
      spO2: 97,
      bloodPressure: '115/75',
      temperature: 36.5,
      lastUpdated: '1 hour ago',
      hydrationLevel: 60,
      stressLevel: 75, // High - ALERT
      hydrationHistory: [50, 55, 60, 65, 60, 55, 60],
      heartRateHistory: [80, 90, 100, 110, 105, 110],
      stressHistory: ['High', 'High', 'Critical', 'High', 'High', 'High']
    },
    alerts: [
      {
        id: 'a2',
        type: 'Health',
        message: 'High Heart Rate detected',
        severity: 'Critical',
        timestamp: '5 mins ago'
      },
      {
        id: 'a3',
        type: 'Safety',
        message: 'Unknown Location',
        severity: 'Critical',
        timestamp: '1 hour ago'
      }
    ],
    // Audio Data - DISTRESS (DANGER)
    audioStatus: 'distress',
    riskScore: 92,
    riskHistory: [30, 40, 60, 85, 90, 92],
    audioEvents: [
      { time: '11:10 AM', label: 'Scream', type: 'danger' },
      { time: '11:05 AM', label: 'Crying', type: 'danger' },
      { time: '11:00 AM', label: 'Unknown Voice', type: 'warning' }
    ],
    trustedVoices: [
      { id: 'v1', name: 'Dad', relation: 'Father', initials: 'DA' }
    ],
    privacyLogs: [
      { timestamp: '11:10 AM', label: 'Scream', confidence: 92 },
      { timestamp: '11:05 AM', label: 'Crying', confidence: 85 },
      { timestamp: '11:00 AM', label: 'Unknown Voice', confidence: 80 }
    ]
  }
];
