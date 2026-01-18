'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Camera, Upload } from 'lucide-react';
import { useState as useStateEffect } from 'react';

export default function SecurityDashboard() {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [showCamera, setShowCamera] = useState(false);
  const [selfie, setSelfie] = useState<Blob | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    vehicle: '',
    purpose: '',
    member_id: '',
  });
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Initialize camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setShowCamera(true);
      }
    } catch (err) {
      setError('Unable to access camera');
    }
  };

  // Capture selfie
  const captureSelfie = () => {
    if (canvasRef.current && videoRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, 320, 240);
        canvasRef.current.toBlob((blob) => {
          if (blob) {
            setSelfie(blob);
          }
        });
      }
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      setShowCamera(false);
    }
  };

  // Fetch members
  const loadMembers = async () => {
    setIsLoadingMembers(true);
    const response = await apiClient.get('/members');
    if (response.success && response.data) {
      setMembers(response.data);
    }
    setIsLoadingMembers(false);
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selfie) {
      setError('Please capture a selfie');
      return;
    }

    if (!formData.member_id) {
      setError('Please select a member');
      return;
    }

    setIsLoading(true);

    try {
      const formDataObj = new FormData();
      formDataObj.append('name', formData.name);
      formDataObj.append('phone', formData.phone);
      formDataObj.append('vehicle', formData.vehicle);
      formDataObj.append('purpose', formData.purpose);
      formDataObj.append('member_id', formData.member_id);
      formDataObj.append('selfie', selfie);

      const response = await apiClient.postFormData('/visitors', formDataObj);

      if (response.success) {
        setSuccess('Visitor added successfully');
        setFormData({ name: '', phone: '', vehicle: '', purpose: '', member_id: '' });
        setSelfie(null);
        setShowCamera(false);
      } else {
        setError(response.message || 'Failed to add visitor');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Security Dashboard</h1>
        <p className="text-muted-foreground">Add new visitors to the premises</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <Card className="lg:col-span-2 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
                <AlertDescription className="text-green-800 dark:text-green-200">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            {/* Selfie Section */}
            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
              {selfie ? (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-green-600">
                    ✓ Selfie captured
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelfie(null)}
                  >
                    Retake Selfie
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {!showCamera ? (
                    <Button
                      type="button"
                      onClick={() => {
                        startCamera();
                        loadMembers();
                      }}
                      className="mx-auto"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Start Camera
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={captureSelfie}
                      className="mx-auto bg-blue-600 hover:bg-blue-700"
                    >
                      Capture Photo
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Visitor Details */}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Visitor Name *</label>
                <Input
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Phone Number *</label>
                <Input
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Vehicle Number</label>
                <Input
                  placeholder="MH01AB1234"
                  value={formData.vehicle}
                  onChange={(e) =>
                    setFormData({ ...formData, vehicle: e.target.value })
                  }
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Purpose *</label>
                <Input
                  placeholder="Meeting, event, etc."
                  value={formData.purpose}
                  onChange={(e) =>
                    setFormData({ ...formData, purpose: e.target.value })
                  }
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Select Member *</label>
                <Select
                  value={formData.member_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, member_id: value })
                  }
                  disabled={isLoadingMembers}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a member" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.id.toString()}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isLoading || !selfie}
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Add Visitor
            </Button>
          </form>
        </Card>

        {/* Camera Preview */}
        {showCamera && (
          <Card className="p-4">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full rounded-lg mb-4 bg-black"
              style={{ maxHeight: '400px' }}
            />
            <canvas
              ref={canvasRef}
              className="hidden"
              width="320"
              height="240"
            />
            <Button
              type="button"
              variant="outline"
              onClick={stopCamera}
              className="w-full"
            >
              Close Camera
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
