'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Edit, Trash2, Plus } from 'lucide-react';

interface Member {
  id: number;
  name: string;
  email: string;
  phone: string;
  apartment: string;
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    apartment: '',
  });

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    setIsLoading(true);
    const response = await apiClient.get('/admin/members');
    if (response.success && response.data) {
      setMembers(response.data);
    } else {
      setError(response.message || 'Failed to load members');
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingId) {
        const response = await apiClient.put(`/admin/members/${editingId}`, formData);
        if (response.success) {
          setSuccess('Member updated successfully');
          setEditingId(null);
          await loadMembers();
        } else {
          setError(response.message || 'Update failed');
        }
      } else {
        const response = await apiClient.post('/admin/members', formData);
        if (response.success) {
          setSuccess('Member added successfully');
          await loadMembers();
        } else {
          setError(response.message || 'Add failed');
        }
      }
      setFormData({ name: '', email: '', phone: '', apartment: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleEdit = (member: Member) => {
    setFormData(member);
    setEditingId(member.id);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure?')) return;

    const response = await apiClient.delete(`/admin/members/${id}`);
    if (response.success) {
      setSuccess('Member deleted successfully');
      await loadMembers();
    } else {
      setError(response.message || 'Delete failed');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ name: '', email: '', phone: '', apartment: '' });
  };

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Members Management</h1>
        <p className="text-muted-foreground">Manage society members</p>
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
            {editingId ? 'Edit Member' : 'Add Member'}
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
              <label className="text-sm font-medium">Apartment *</label>
              <Input
                placeholder="Apt No."
                value={formData.apartment}
                onChange={(e) =>
                  setFormData({ ...formData, apartment: e.target.value })
                }
              />
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
              {editingId ? 'Update' : 'Add Member'}
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

        {/* Members List */}
        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : members.length === 0 ? (
            <Card className="text-center py-12 text-muted-foreground">
              No members found
            </Card>
          ) : (
            <div className="space-y-4">
              {members.map((member) => (
                <Card key={member.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold">{member.name}</h3>
                      <div className="text-sm text-muted-foreground mt-1 space-y-0.5">
                        <p>Email: {member.email}</p>
                        <p>Phone: {member.phone}</p>
                        <p>Apartment: {member.apartment}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(member)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(member.id)}
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
