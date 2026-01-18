'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
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

export default function AdminVisitorsPage() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [filteredVisitors, setFilteredVisitors] = useState<Visitor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadVisitors();
  }, []);

  useEffect(() => {
    filterVisitors();
  }, [searchTerm, visitors]);

  const loadVisitors = async () => {
    setIsLoading(true);
    const response = await apiClient.get('/admin/visitors');
    if (response.success && response.data) {
      setVisitors(response.data);
    } else {
      setError(response.message || 'Failed to load visitors');
    }
    setIsLoading(false);
  };

  const filterVisitors = () => {
    const filtered = visitors.filter(
      (v) =>
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.phone.includes(searchTerm) ||
        v.member_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredVisitors(filtered);
  };

  const handleDelete = async (visitorId: number) => {
    if (!window.confirm('Are you sure?')) return;

    const response = await apiClient.delete(`/visitors/${visitorId}`);
    if (response.success) {
      await loadVisitors();
    } else {
      setError(response.message || 'Delete failed');
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">All Visitors</h1>
        <p className="text-muted-foreground">Manage all visitor records</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="mb-6 p-4">
        <Input
          placeholder="Search by name, phone, or member..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border-slate-300"
        />
      </Card>

      <Card>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : filteredVisitors.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No visitors found
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
                  <TableHead>Check-out</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVisitors.map((visitor) => (
                  <TableRow key={visitor.id}>
                    <TableCell className="font-medium">{visitor.name}</TableCell>
                    <TableCell>{visitor.phone}</TableCell>
                    <TableCell>{visitor.member_name}</TableCell>
                    <TableCell>{visitor.purpose}</TableCell>
                    <TableCell>{visitor.vehicle || '-'}</TableCell>
                    <TableCell className="text-sm">
                      {new Date(visitor.checkin_time).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm">
                      {visitor.checkout_time
                        ? new Date(visitor.checkout_time).toLocaleString()
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(visitor.id)}
                      >
                        Delete
                      </Button>
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
