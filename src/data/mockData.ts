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
    alerts: []
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
      stressHistory: ['High', 'High', 'Critical', 'High', 'High', 'High'] // Replaced number array with string array
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
    ]
  }
];
