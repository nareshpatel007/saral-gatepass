'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Check as CheckOut } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Visitor {
  id: number;
  name: string;
  phone: string;
  vehicle: string;
  purpose: string;
  member_name: string;
  checkin_time: string;
  checkout_time: string | null;
}

export default function TodayVisitorsPage() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadVisitors();
  }, []);

  const loadVisitors = async () => {
    setIsLoading(true);
    const response = await apiClient.get('/visitors/today');
    if (response.success && response.data) {
      setVisitors(response.data);
    } else {
      setError(response.message || 'Failed to load visitors');
    }
    setIsLoading(false);
  };

  const handleCheckout = async (visitorId: number) => {
    setIsCheckingOut(visitorId);
    const response = await apiClient.post(`/visitors/${visitorId}/checkout`, {});
    if (response.success) {
      await loadVisitors();
    } else {
      setError(response.message || 'Checkout failed');
    }
    setIsCheckingOut(null);
  };

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Today's Visitors</h1>
        <p className="text-muted-foreground">
          Manage visitor checkouts for today
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : visitors.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No visitors today
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Member</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visitors.map((visitor) => (
                  <TableRow key={visitor.id}>
                    <TableCell className="font-medium">{visitor.name}</TableCell>
                    <TableCell>{visitor.phone}</TableCell>
                    <TableCell>{visitor.member_name}</TableCell>
                    <TableCell>{visitor.purpose}</TableCell>
                    <TableCell>{visitor.vehicle || '-'}</TableCell>
                    <TableCell className="text-sm">
                      {new Date(visitor.checkin_time).toLocaleTimeString()}
                    </TableCell>
                    <TableCell>
                      {visitor.checkout_time ? (
                        <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded">
                          Checked Out
                        </span>
                      ) : (
                        <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded">
                          Inside
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {!visitor.checkout_time && (
                        <Button
                          size="sm"
                          onClick={() => handleCheckout(visitor.id)}
                          disabled={isCheckingOut === visitor.id}
                          className="text-xs"
                        >
                          {isCheckingOut === visitor.id && (
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          )}
                          Checkout
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
