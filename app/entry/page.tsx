"use client"

import type React from "react";
import { useState, useRef } from "react";
import { uploadBlobToImageKit } from "@/lib/imagekit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Camera, AlertCircle, X, User, CheckCircle } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import Image from "next/image";

// Configuration for blocks, floors, and flats
const BLOCK_CONFIG = {
    A: {
        floors: 7,
        flatsPerFloor: 4
    },
    B: {
        floors: 7,
        flatsPerFloor: 3
    }
};

// Initial form data
const INITIAL_FORM_DATA = {
    block: "",
    house: "",
    name: "",
    phone: "",
    purpose: "",
    vehicle: "",
    selfie_url: ""
};

export default function EntryPage() {
    // Refs for video and canvas elements
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Define state variables
    const [isLoading, setIsLoading] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const [selfie, setSelfie] = useState<Blob | null>(null);
    const [selfiePreviewUrl, setSelfiePreviewUrl] = useState<string>("");
    const [selfieImageKitUrl, setSelfieImageKitUrl] = useState<string>("");
    const [formData, setFormData] = useState(INITIAL_FORM_DATA);

    const [isUploadingToImageKit, setIsUploadingToImageKit] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Handle uploading selfie to ImageKit when selfie blob changes
    const startCamera = async () => {
        try {
            if (!navigator.mediaDevices?.getUserMedia) {
                setError("Camera not supported")
                return
            }

            // Show video first
            setShowCamera(true)

            // Wait for React render
            await new Promise((res) => setTimeout(res, 100))

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "user",
                    width: { ideal: 640 },
                    height: { ideal: 640 },
                },
            })

            if (videoRef.current) {
                videoRef.current.srcObject = stream
                videoRef.current.muted = true
                videoRef.current.playsInline = true
                await videoRef.current.play()
            }
        } catch (err) {
            console.error("Camera error:", err)
            setError("Unable to access camera")
            setShowCamera(false)
        }
    }

    // Capture selfie from video stream
    const captureSelfie = () => {
        if (!videoRef.current || !canvasRef.current) return

        const video = videoRef.current
        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        // Ensure video is ready
        if (video.videoWidth === 0) {
            setError("Camera not ready, try again")
            return
        }

        // Set canvas size to video size
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        // Mirror fix (because video is mirrored)
        ctx.save()
        ctx.scale(-1, 1)
        ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height)
        ctx.restore()

        canvas.toBlob(
            (blob) => {
                if (!blob) return

                setSelfie(blob)
                setSelfiePreviewUrl(URL.createObjectURL(blob))
                stopCamera()
            },
            "image/jpeg",
            0.9
        )
    }

    // Stop camera and video stream
    const stopCamera = () => {
        if (videoRef.current?.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach((track) => track.stop());
            videoRef.current.srcObject = null;
        }
        setShowCamera(false);
    }

    // Retake selfie
    const retakeSelfie = () => {
        if (selfiePreviewUrl) {
            URL.revokeObjectURL(selfiePreviewUrl);
        }
        setSelfie(null);
        setSelfiePreviewUrl("");
    }

    const uploadSelfieToCloud = async (blob: Blob) => {
        const response: any = await uploadBlobToImageKit(blob);
        return response;
    }

    // Upload selfie to ImageKit when selfie blob changes
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        // Validation checks
        if (!selfie) {
            setError("Please capture your selfie");
            return;
        } else if (!formData.block || !formData.house || !formData.name || !formData.phone || !formData.purpose) {
            setError("Please fill all required fields");
            return;
        }

        // All good, proceed
        setIsLoading(true);

        try {
            // Define variable for ImageKit URL
            let imageKitUrl = "";

            // If already uploaded to ImageKit, skip upload
            if (!selfieImageKitUrl) {
                imageKitUrl = await uploadSelfieToCloud(selfie);
                setSelfieImageKitUrl(imageKitUrl);
            } else {
                imageKitUrl = selfieImageKitUrl;
            }

            // API call to submit entry
            const res = await fetch("/api/entry", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    block: formData.block,
                    house: formData.house,
                    name: formData.name,
                    phone: formData.phone,
                    purpose: formData.purpose,
                    vehicle: formData.vehicle,
                    selfie_url: imageKitUrl,
                }),
            });

            // Check response
            if (!res.ok) {
                // Set error message
                setError("Oops! Failed to submit entry");
            } else {
                // Set success message
                setSuccess("Thanks! Your entry has been submitted!");

                // Cleanup selfie and reset form
                cleanupSelfie();
                setFormData(INITIAL_FORM_DATA);

                // Scroll to top
                window.scrollTo({ top: 0, behavior: "smooth" });

                // Clear success message after 5 seconds
                setTimeout(() => setSuccess(""), 5000);
            }
        } catch (err) {
            // Handle errors
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            // Finalize loading state
            setIsLoading(false);
        }
    }

    const cleanupSelfie = () => {
        if (selfiePreviewUrl) {
            URL.revokeObjectURL(selfiePreviewUrl);
        }

        setSelfie(null);
        setSelfiePreviewUrl("");
        setSelfieImageKitUrl("");
    }

    // Generate list of houses
    const generateHouses = (block: "A" | "B") => {
        const config = BLOCK_CONFIG[block];
        if (!config) return [];
        const houses: string[] = [];
        for (let floor = 1; floor <= config.floors; floor++) {
            for (let flat = 1; flat <= config.flatsPerFloor; flat++) {
                houses.push(`${floor}${String(flat).padStart(2, "0")}`)
            }
        }
        return houses;
    }

    console.log(formData);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-2">
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>
            <div className="max-w-2xl mx-auto pb-20">
                <div className="mb-8 text-center mt-5">
                    <h1 className="text-3xl font-bold mb-2">Saral Revanta</h1>
                    <p className="text-muted-foreground">Register your visitor entry</p>
                </div>
                <Card className="p-3 md:p-8 shadow-lg">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <Alert className="text-red-500" variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription className="!text-red-500">{error}</AlertDescription>
                            </Alert>
                        )}

                        {success && (
                            <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
                                <AlertDescription className="text-green-800 dark:text-green-200">✓ &nbsp;{success}</AlertDescription>
                            </Alert>
                        )}

                        {/* Selfie Capture Section */}
                        <div className="border-2 border-dashed border-border rounded-lg p-6 bg-background/50">
                            <div className="flex flex-col items-center gap-2">
                                <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                    {selfie && selfiePreviewUrl ? (
                                        <Image
                                            src={selfiePreviewUrl || "/placeholder.svg"}
                                            alt="Captured selfie"
                                            className="w-full h-full object-cover"
                                            width={128}
                                            height={128}
                                        />
                                    ) : showCamera ? (
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            playsInline
                                            muted
                                            className="w-full h-full object-cover scale-x-[-1]"
                                        />

                                    ) : (
                                        <User className="w-16 h-16 text-slate-300 dark:text-slate-600" />
                                    )}
                                </div>

                                {/* Hidden canvas for capture */}
                                <canvas ref={canvasRef} className="hidden" width="320" height="240" />

                                {/* Status Text */}
                                {!isLoading && (
                                    <div className="text-center">
                                        {selfie ? (
                                            <div className="text-green-600 dark:text-green-400 font-medium">Photo Captured</div>
                                        ) : showCamera ? (
                                            <div className="text-blue-600 dark:text-blue-400 font-medium">Click to capture your photo</div>
                                        ) : (
                                            <div className="text-muted-foreground text-sm">Tap to capture your photo</div>
                                        )}
                                    </div>
                                )}

                                {/* Action Buttons */}
                                {!isLoading && (
                                    <div className="flex gap-2 flex-wrap justify-center">
                                        {selfie && selfiePreviewUrl ? (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={retakeSelfie}
                                                disabled={isUploadingToImageKit}
                                                className="flex items-center gap-2 bg-transparent"
                                            >
                                                <Camera className="w-4 h-4" />
                                                Retake Photo
                                            </Button>
                                        ) : showCamera ? (
                                            <>
                                                <Button
                                                    type="button"
                                                    onClick={captureSelfie}
                                                    disabled={isUploadingToImageKit}
                                                    className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                                                >
                                                    <Camera className="w-4 h-4" />
                                                    Capture
                                                </Button>
                                                <Button type="button" variant="outline" onClick={stopCamera}>
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </>
                                        ) : (
                                            <Button
                                                type="button"
                                                onClick={startCamera}
                                                disabled={isUploadingToImageKit}
                                                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                                            >
                                                <Camera className="w-4 h-4" />
                                                Start Camera
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold">Visitor Information</h2>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-sm font-medium">Choose Block</label>
                                    <Select
                                        value={formData.block}
                                        onValueChange={(value) =>
                                            setFormData({ ...formData, block: value, house: "" })
                                        }
                                    >
                                        <SelectTrigger className="w-full text-sm mt-1">
                                            <SelectValue placeholder="Select block" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="A">Block A</SelectItem>
                                            <SelectItem value="B">Block B</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Choose House</label>
                                    <Select
                                        value={formData.house}
                                        onValueChange={(value) =>
                                            setFormData({ ...formData, house: value })
                                        }
                                        disabled={!formData.block}
                                    >
                                        <SelectTrigger className="w-full text-sm mt-1">
                                            <SelectValue placeholder="Select house" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {formData.block &&
                                                generateHouses(formData.block as "A" | "B").map((house) => (
                                                    <SelectItem key={house} value={house}>
                                                        {house}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Full Name</label>
                                <Input
                                    placeholder="Full name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    disabled={isLoading}
                                    required
                                    className="mt-1 text-sm"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Mobile Number</label>
                                <Input
                                    placeholder="Mobile number"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    disabled={isLoading}
                                    required
                                    className="mt-1 text-sm"
                                    type="tel"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Purpose of Visit</label>
                                <Select
                                    value={formData.purpose}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, purpose: value })
                                    }
                                >
                                    <SelectTrigger className="w-full text-sm mt-1">
                                        <SelectValue placeholder="Select purpose" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Guest">Guest</SelectItem>
                                        <SelectItem value="Visit">Visit</SelectItem>
                                        <SelectItem value="Parcel Delivery">Parcel Delivery</SelectItem>
                                        <SelectItem value="Courier Delivery">Courier Delivery</SelectItem>
                                        <SelectItem value="Food Delivery">Food Delivery</SelectItem>
                                        <SelectItem value="Grocery Delivery">Grocery Delivery</SelectItem>
                                        <SelectItem value="E-commerce Delivery">E-commerce Delivery</SelectItem>
                                        <SelectItem value="Pickup">Pickup</SelectItem>
                                        <SelectItem value="Emergency">Emergency</SelectItem>
                                        <SelectItem value="Event/Function">Event / Function</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Vehicle Number (optional)</label>
                                <Input
                                    placeholder="Vehicle number"
                                    value={formData.vehicle}
                                    onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                                    disabled={isLoading}
                                    className="mt-1 text-sm"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-5"
                            disabled={isLoading || !selfie}
                            size="lg"
                        >
                            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {!isLoading && <CheckCircle className="w-4 h-4" />}
                            Submit Entry
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    )
}
