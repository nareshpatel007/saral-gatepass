'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Edit, Trash2 } from 'lucide-react';

interface SecurityStaff {
  id: number;
  name: string;
  email: string;
  phone: string;
  shift: string;
}

export default function SecurityStaffPage() {
  const [staff, setStaff] = useState<SecurityStaff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    shift: '',
  });

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    setIsLoading(true);
    const response = await apiClient.get('/admin/security-staff');
    if (response.success && response.data) {
      setStaff(response.data);
    } else {
      setError(response.message || 'Failed to load staff');
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingId) {
        const response = await apiClient.put(
          `/admin/security-staff/${editingId}`,
          formData
        );
        if (response.success) {
          setSuccess('Staff updated successfully');
          setEditingId(null);
          await loadStaff();
        } else {
          setError(response.message || 'Update failed');
        }
      } else {
        const response = await apiClient.post('/admin/security-staff', formData);
        if (response.success) {
          setSuccess('Staff added successfully');
          await loadStaff();
        } else {
          setError(response.message || 'Add failed');
        }
      }
      setFormData({ name: '', email: '', phone: '', shift: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleEdit = (staffMember: SecurityStaff) => {
    setFormData(staffMember);
    setEditingId(staffMember.id);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure?')) return;

    const response = await apiClient.delete(`/admin/security-staff/${id}`);
    if (response.success) {
      setSuccess('Staff deleted successfully');
      await loadStaff();
    } else {
      setError(response.message || 'Delete failed');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ name: '', email: '', phone: '', shift: '' });
  };

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Security Staff Management</h1>
        <p className="text-muted-foreground">Manage security personnel</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
          <AlertDescription className="text-green-800 dark:text-green-200">
            {success}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <Card className="lg:col-span-1 p-6 h-fit">
          <h2 className="font-bold mb-4">
            {editingId ? 'Edit Staff' : 'Add Staff'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-sm font-medium">Name *</label>
              <Input
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium">Email *</label>
              <Input
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium">Phone *</label>
              <Input
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium">Shift *</label>
              <Input
                placeholder="Morning/Evening/Night"
                value={formData.shift}
                onChange={(e) =>
                  setFormData({ ...formData, shift: e.target.value })
                }
              />
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
              {editingId ? 'Update' : 'Add Staff'}
            </Button>

            {editingId && (
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="w-full"
              >
                Cancel
              </Button>
            )}
          </form>
        </Card>

        {/* Staff List */}
        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : staff.length === 0 ? (
            <Card className="text-center py-12 text-muted-foreground">
              No staff found
            </Card>
          ) : (
            <div className="space-y-4">
              {staff.map((staffMember) => (
                <Card key={staffMember.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold">{staffMember.name}</h3>
                      <div className="text-sm text-muted-foreground mt-1 space-y-0.5">
                        <p>Email: {staffMember.email}</p>
                        <p>Phone: {staffMember.phone}</p>
                        <p>Shift: {staffMember.shift}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(staffMember)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(staffMember.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
