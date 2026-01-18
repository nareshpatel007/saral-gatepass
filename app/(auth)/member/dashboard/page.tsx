'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { useState as useStateToggle } from 'react';

export default function MemberDashboard() {
  const { user } = useAuth();
  const [visitors, setVisitors] = useState<any[]>([]);
  const [filteredVisitors, setFilteredVisitors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<'today' | 'all'>('today');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadVisitors();
  }, []);

  const loadVisitors = async () => {
    setIsLoading(true);
    const response = await apiClient.get('/visitors/my-visitors');
    if (response.success && response.data) {
      setVisitors(response.data);
      setFilteredVisitors(response.data.filter((v: any) => isToday(v.checkin_time)));
    } else {
      setError(response.message || 'Failed to load visitors');
    }
    setIsLoading(false);
  };

  const isToday = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const handleFilterChange = (type: 'today' | 'all') => {
    setFilterType(type);
    if (type === 'today') {
      setFilteredVisitors(visitors.filter((v) => isToday(v.checkin_time)));
    } else {
      setFilteredVisitors(visitors);
    }
  };

  const handleDateFilter = () => {
    if (!startDate || !endDate) {
      setError('Please select both dates');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const filtered = visitors.filter((v) => {
      const visitDate = new Date(v.checkin_time);
      return visitDate >= start && visitDate <= end;
    });

    setFilteredVisitors(filtered);
  };

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Visitors</h1>
        <p className="text-muted-foreground">View visitors who visited you</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filter Section */}
      <Card className="mb-6 p-6">
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filterType === 'today' ? 'default' : 'outline'}
              onClick={() => handleFilterChange('today')}
            >
              Today
            </Button>
            <Button
              variant={filterType === 'all' ? 'default' : 'outline'}
              onClick={() => handleFilterChange('all')}
            >
              All Visitors
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Start Date"
            />
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="End Date"
            />
            <Button onClick={handleDateFilter} className="bg-blue-600 hover:bg-blue-700">
              Filter by Date Range
            </Button>
          </div>
        </div>
      </Card>

      {/* Visitors List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : filteredVisitors.length === 0 ? (
        <Card className="text-center py-12 text-muted-foreground">
          No visitors found
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVisitors.map((visitor) => (
            <Card key={visitor.id} className="p-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">{visitor.name}</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>
                    <strong>Phone:</strong> {visitor.phone}
                  </p>
                  <p>
                    <strong>Purpose:</strong> {visitor.purpose}
                  </p>
                  <p>
                    <strong>Vehicle:</strong> {visitor.vehicle || '-'}
                  </p>
                  <p>
                    <strong>Check-in:</strong>{' '}
                    {new Date(visitor.checkin_time).toLocaleString()}
                  </p>
                  {visitor.checkout_time && (
                    <p>
                      <strong>Check-out:</strong>{' '}
                      {new Date(visitor.checkout_time).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
