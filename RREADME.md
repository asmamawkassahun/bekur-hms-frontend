# Report & Analytics Module

## Overview

The Report & Analytics Module provides comprehensive reporting capabilities for the Bekur HMS backend. It generates detailed reports on occupancy, revenue, operational metrics, financial performance, and guest analytics to help property managers make data-driven decisions.

## Features

### Core Features

- **Occupancy Reports**: Track room and bed occupancy rates with trends and forecasts
- **Revenue Reports**: Analyze revenue performance, payment methods, and room type performance
- **Operational Reports**: Monitor arrivals, departures, current guests, and housekeeping status
- **Financial Reports**: Track revenue, refunds, invoices, and financial health
- **Guest Analytics**: Analyze guest demographics, booking patterns, and loyalty metrics
- **Chart Generation**: Visual representation of data with configurable charts
- **Period Grouping**: Group data by day, week, month, or year
- **Report Storage**: Save and retrieve generated reports

### Report Types

- `OCCUPANCY`: Room and bed occupancy analysis
- `REVENUE`: Revenue performance and trends
- `OPERATIONAL`: Daily operations and guest management
- `FINANCIAL`: Financial performance and invoice tracking
- `GUEST_ANALYTICS`: Guest demographics and behavior analysis

## API Endpoints

### Generate Report

**POST** `/reports/generate`

Generate a comprehensive report based on specified criteria.

**Request Body:**
```json
{
  "type": "OCCUPANCY",
  "propertyId": "prop_123",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "groupBy": "day",
  "includeCharts": true,
  "roomTypeId": "room_type_123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "report_123",
    "type": "OCCUPANCY",
    "propertyId": "prop_123",
    "startDate": "2024-01-01T00:00:00Z",
    "endDate": "2024-01-31T23:59:59Z",
    "data": {
      "summary": {
        "totalRooms": 50,
        "totalBeds": 100,
        "roomOccupancyRate": 75.5,
        "bedOccupancyRate": 68.2
      },
      "dailyData": [...],
      "charts": {...}
    },
    "createdAt": "2024-01-10T10:00:00Z"
  },
  "message": "Report generated successfully"
}
```

### Generate Occupancy Report

**POST** `/reports/occupancy`

Generate a detailed occupancy report.

**Request Body:**
```json
{
  "propertyId": "prop_123",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "groupBy": "week",
  "includeCharts": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalRooms": 50,
      "totalBeds": 100,
      "totalRoomNights": 1200,
      "totalBedNights": 2400,
      "roomOccupancyRate": 75.5,
      "bedOccupancyRate": 68.2,
      "averageRoomOccupancy": 72.3,
      "averageBedOccupancy": 65.8
    },
    "dailyData": [
      {
        "period": "2024-01-01",
        "occupiedRooms": 35,
        "occupiedBeds": 70,
        "roomOccupancyRate": 70.0,
        "bedOccupancyRate": 70.0
      }
    ],
    "charts": {
      "occupancyTrend": {
        "type": "line",
        "data": [...]
      }
    }
  },
  "message": "Occupancy report generated successfully"
}
```

### Generate Revenue Report

**POST** `/reports/revenue`

Generate a comprehensive revenue analysis report.

**Request Body:**
```json
{
  "propertyId": "prop_123",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "groupBy": "month",
  "includeCharts": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalRevenue": 50000,
      "totalReservations": 150,
      "averageRevenuePerReservation": 333.33,
      "averageDailyRevenue": 1612.90
    },
    "dailyData": [...],
    "revenueByMethod": [
      {
        "method": "CARD",
        "amount": 30000,
        "percentage": 60.0
      },
      {
        "method": "CASH",
        "amount": 15000,
        "percentage": 30.0
      }
    ],
    "revenueByRoomType": [
      {
        "type": "DELUXE",
        "amount": 25000,
        "percentage": 50.0
      }
    ],
    "charts": {
      "revenueTrend": {
        "type": "line",
        "data": [...]
      }
    }
  },
  "message": "Revenue report generated successfully"
}
```

### Generate Operational Report

**POST** `/reports/operational`

Generate an operational report for daily hotel management.

**Request Body:**
```json
{
  "propertyId": "prop_123",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalArrivals": 45,
      "totalDepartures": 42,
      "currentGuests": 38,
      "noShows": 3,
      "housekeepingTasksCompleted": 120,
      "housekeepingTasksPending": 15
    },
    "arrivals": [
      {
        "id": "res_123",
        "guestName": "John Doe",
        "checkIn": "2024-01-15T14:00:00Z",
        "roomNumber": "101",
        "status": "CONFIRMED"
      }
    ],
    "departures": [...],
    "currentGuests": [...],
    "noShows": [...],
    "housekeepingStatus": [
      {
        "status": "COMPLETED",
        "count": 120,
        "percentage": 88.9
      }
    ]
  },
  "message": "Operational report generated successfully"
}
```

### Generate Financial Report

**POST** `/reports/financial`

Generate a comprehensive financial performance report.

**Request Body:**
```json
{
  "propertyId": "prop_123",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "groupBy": "week"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalRevenue": 50000,
      "totalRefunds": 2000,
      "netRevenue": 48000,
      "totalInvoices": 150,
      "paidInvoices": 140,
      "outstandingInvoices": 10,
      "overdueInvoices": 2,
      "totalInvoiceAmount": 50000,
      "paidInvoiceAmount": 46000,
      "outstandingAmount": 4000
    },
    "revenueByMethod": [...],
    "dailyFinancial": [...],
    "charts": {
      "netRevenue": {
        "type": "line",
        "data": [...]
      }
    }
  },
  "message": "Financial report generated successfully"
}
```

### Generate Guest Analytics Report

**POST** `/reports/guest-analytics`

Generate a detailed guest analytics and demographics report.

**Request Body:**
```json
{
  "propertyId": "prop_123",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalGuests": 120,
      "newGuests": 80,
      "repeatGuests": 40,
      "averageStaysPerGuest": 1.25
    },
    "demographics": {
      "ageGroups": [
        { "age": "18-25", "count": 30 },
        { "age": "26-35", "count": 45 }
      ],
      "countries": [
        { "country": "USA", "count": 60 },
        { "country": "Canada", "count": 25 }
      ],
      "genders": [
        { "gender": "male", "count": 65 },
        { "gender": "female", "count": 55 }
      ]
    },
    "bookingPatterns": {
      "advanceBooking": {
        "0-7": 20,
        "8-30": 45,
        "31-90": 35,
        "90+": 20
      },
      "dayOfWeek": {
        "friday": 25,
        "saturday": 30,
        "sunday": 20
      },
      "lengthOfStay": {
        "1": 15,
        "2-3": 60,
        "4-7": 35,
        "8+": 10
      }
    },
    "loyaltyAnalysis": [
      {
        "tier": "BRONZE",
        "count": 80,
        "percentage": 66.7
      },
      {
        "tier": "SILVER",
        "count": 30,
        "percentage": 25.0
      }
    ],
    "repeatGuests": [...],
    "charts": {
      "ageDistribution": {
        "type": "pie",
        "data": [...]
      }
    }
  },
  "message": "Guest analytics report generated successfully"
}
```

### List Reports

**GET** `/reports`

Retrieve saved reports with filtering and pagination.

**Query Parameters:**
- `type` (optional): Filter by report type
- `propertyId` (optional): Filter by property
- `startDate` (optional): Filter by creation date from
- `endDate` (optional): Filter by creation date to
- `search` (optional): Search in report type or property name
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `sortBy` (optional): Sort field (default: createdAt)
- `sortOrder` (optional): Sort order (asc/desc, default: desc)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "report_123",
      "type": "OCCUPANCY",
      "propertyId": "prop_123",
      "startDate": "2024-01-01T00:00:00Z",
      "endDate": "2024-01-31T23:59:59Z",
      "createdAt": "2024-01-10T10:00:00Z",
      "property": {
        "id": "prop_123",
        "name": "Bekur Hotel Downtown"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  },
  "message": "Reports retrieved successfully"
}
```

### Get Report Details

**GET** `/reports/:id`

Retrieve details of a specific report including the full data.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "report_123",
    "type": "OCCUPANCY",
    "propertyId": "prop_123",
    "startDate": "2024-01-01T00:00:00Z",
    "endDate": "2024-01-31T23:59:59Z",
    "data": {
      "summary": {...},
      "dailyData": [...],
      "charts": {...}
    },
    "createdAt": "2024-01-10T10:00:00Z",
    "property": {
      "id": "prop_123",
      "name": "Bekur Hotel Downtown"
    }
  },
  "message": "Report retrieved successfully"
}
```

### Delete Report

**DELETE** `/reports/:id`

Soft delete a saved report.

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Report deleted successfully"
  },
  "message": "Report deleted successfully"
}
```

## DTOs

### GenerateReportDto

```typescript
{
  type: ReportType;
  propertyId: string;
  startDate: string;
  endDate: string;
  groupBy?: GroupByPeriod; // 'day' | 'week' | 'month' | 'year'
  includeCharts?: boolean;
  roomTypeId?: string;
  dormitoryId?: string;
  paymentMethod?: string;
  guestId?: string;
}
```

### ReportQueryDto

```typescript
{
  type?: ReportType;
  propertyId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
```

## Report Types

### Occupancy Report

**Metrics:**
- Total rooms and beds available
- Daily occupancy rates for rooms and beds
- Average occupancy rates
- Occupancy trends and patterns

**Data Points:**
- Occupied rooms/beds per day
- Available rooms/beds per day
- Occupancy percentage per day
- Room nights and bed nights

### Revenue Report

**Metrics:**
- Total revenue for the period
- Average revenue per reservation
- Average daily revenue
- Revenue by payment method
- Revenue by room type

**Data Points:**
- Daily revenue amounts
- Revenue breakdown by payment method
- Revenue breakdown by room type
- Revenue trends and patterns

### Operational Report

**Metrics:**
- Total arrivals and departures
- Current guest count
- No-show tracking
- Housekeeping task completion

**Data Points:**
- Arrival/departure lists with guest details
- Current guest information
- No-show analysis
- Housekeeping status breakdown

### Financial Report

**Metrics:**
- Total revenue and refunds
- Net revenue calculation
- Invoice status tracking
- Outstanding amounts

**Data Points:**
- Daily financial performance
- Revenue vs refunds
- Invoice payment status
- Financial health indicators

### Guest Analytics Report

**Metrics:**
- Guest demographics (age, gender, nationality)
- Booking patterns (advance booking, day of week, length of stay)
- Loyalty tier distribution
- Repeat guest analysis

**Data Points:**
- Age group distribution
- Country of origin
- Gender distribution
- Booking behavior patterns
- Loyalty program participation

## Permissions

### Required Permissions

- `report:generate` - Generate new reports
- `report:read` - View reports and statistics
- `report:delete` - Delete saved reports

### Role Access

- **SUPER_ADMIN**: Full access to all report types
- **PROPERTY_MANAGER**: Full access within assigned properties
- **FRONT_DESK**: Can generate operational reports
- **HOUSEKEEPING**: Can view operational reports
- **FINANCE_STAFF**: Can generate financial and revenue reports

## Chart Generation

The module supports various chart types for data visualization:

### Chart Types

- **Line Charts**: For trends over time (occupancy, revenue)
- **Bar Charts**: For comparisons (revenue by method, demographics)
- **Pie Charts**: For distributions (payment methods, age groups)
- **Area Charts**: For cumulative data

### Chart Data Format

```typescript
{
  type: 'line' | 'bar' | 'pie' | 'area',
  data: Array<{ x: string, y: number }> | Array<{ name: string, value: number }>
}
```

## Period Grouping

Reports can be grouped by different time periods:

- **Day**: Daily data points
- **Week**: Weekly aggregated data
- **Month**: Monthly aggregated data
- **Year**: Yearly aggregated data

## Integration

### With Other Modules

- **Reservation Module**: Provides booking and occupancy data
- **Payment Module**: Provides revenue and transaction data
- **Guest Module**: Provides guest demographics and behavior data
- **Property Module**: Provides property-specific filtering
- **Housekeeping Module**: Provides operational status data

### Data Sources

- **Reservations**: Booking patterns, occupancy data
- **Payments**: Revenue data, payment methods
- **Guests**: Demographics, loyalty information
- **Invoices**: Financial tracking, payment status
- **Housekeeping Tasks**: Operational efficiency metrics

## Usage Examples

### Frontend Integration

```typescript
// Generate occupancy report
const occupancyReport = await fetch('/api/reports/occupancy', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    propertyId: 'prop_123',
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    groupBy: 'week',
    includeCharts: true
  })
});

// Get saved reports
const reports = await fetch('/api/reports?type=REVENUE&page=1&limit=10', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Get specific report
const report = await fetch('/api/reports/report_123', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Backend Integration

```typescript
// Generate monthly revenue report
const revenueReport = await this.reportService.generateReport({
  type: ReportType.REVENUE,
  propertyId: 'prop_123',
  startDate: '2024-01-01',
  endDate: '2024-01-31',
  groupBy: GroupByPeriod.MONTH,
  includeCharts: true
}, userId);

// Get report statistics
const reportStats = await this.reportService.findAll({
  type: ReportType.OCCUPANCY,
  propertyId: 'prop_123',
  page: 1,
  limit: 10
});
```

## Performance Considerations

### Data Aggregation

- Reports are generated on-demand to ensure real-time data
- Large date ranges are automatically optimized for performance
- Caching can be implemented for frequently accessed reports

### Memory Management

- Large datasets are processed in chunks
- Chart data is generated only when requested
- Report data is stored efficiently in the database

## Future Enhancements

- **Scheduled Reports**: Automatic report generation and email delivery
- **Custom Dashboards**: User-configurable report dashboards
- **Export Options**: PDF, Excel, CSV export capabilities
- **Advanced Analytics**: Machine learning insights and predictions
- **Real-time Updates**: Live dashboard with real-time data
- **Report Templates**: Pre-configured report templates
- **Comparative Analysis**: Year-over-year and period comparisons
- **Alert System**: Automated alerts based on report thresholds

## Related Modules

- **Reservation Module**: Provides core booking data
- **Payment Module**: Provides financial transaction data
- **Guest Module**: Provides guest demographic data
- **Property Module**: Provides property-specific context
- **Housekeeping Module**: Provides operational metrics
- **Audit Module**: Tracks report generation activities
