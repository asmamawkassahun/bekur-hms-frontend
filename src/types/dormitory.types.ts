export interface OccupiedBedDetail {
  bedId: string;
  bedNumber: string;
  dormitoryName: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
}

export interface DormitoryOccupancySummary {
  dormitoryId: string;
  dormitoryName: string;
  totalBeds: number;
  occupiedBeds: number;
  occupancyRate: number;
}

export interface DailyDormitoryOccupancy {
  date: string;
  occupancyRate: number;
  totalDormitories: number;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  dormitorySummaries: DormitoryOccupancySummary[];
  occupiedBedDetails: OccupiedBedDetail[];
}
