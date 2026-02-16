"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/shared/PageHeader";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import {
  UserPlus, Camera, Upload, ZoomIn, RotateCw, Check, X,
  User, Phone, Mail, MapPin, Users, Heart, FileText,
  Fingerprint, ChevronLeft, Save, Loader2, ImageIcon,
  Video, RefreshCw, AlertCircle,
} from "lucide-react";

/* ================= PHOTO CROPPER ================= */

function PhotoCropper({
  imageSrc,
  onSave,
  onCancel,
  labels,
}: {
  imageSrc: string;
  onSave: (cropped: string) => void;
  onCancel: () => void;
  labels: { title: string; zoom: string; rotate: string; save: string; cancel: string };
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      drawCanvas();
    };
    img.src = imageSrc;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageSrc]);

  useEffect(() => {
    drawCanvas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom, rotation, offset]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 280;
    canvas.width = size;
    canvas.height = size;

    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.clip();

    ctx.translate(size / 2 + offset.x, size / 2 + offset.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    const scale = Math.max(size / img.width, size / img.height);
    const w = img.width * scale;
    const h = img.height * scale;
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();

    /* Circle border */
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 1, 0, Math.PI * 2);
    ctx.strokeStyle = "#F35403";
    ctx.lineWidth = 3;
    ctx.stroke();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    setOffset({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
  };
  const handleMouseUp = () => setDragging(false);

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onSave(canvas.toDataURL("image/png"));
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">{labels.title}</h3>
          <button onClick={onCancel} className="p-1.5 hover:bg-gray-100 rounded-lg transition">
            <X size={18} />
          </button>
        </div>

        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            className="rounded-full cursor-grab active:cursor-grabbing"
            style={{ width: 280, height: 280 }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <ZoomIn size={14} className="text-gray-500 shrink-0" />
            <span className="text-[11px] text-gray-500 w-10">{labels.zoom}</span>
            <input
              type="range" min="0.5" max="3" step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="flex-1 accent-[#F35403]"
            />
          </div>
          <div className="flex items-center gap-3">
            <RotateCw size={14} className="text-gray-500 shrink-0" />
            <span className="text-[11px] text-gray-500 w-10">{labels.rotate}</span>
            <input
              type="range" min="0" max="360" step="1"
              value={rotation}
              onChange={(e) => setRotation(parseInt(e.target.value))}
              className="flex-1 accent-[#F35403]"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition"
          >
            {labels.cancel}
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-[#F35403] rounded-xl hover:bg-[#d14a03] transition"
          >
            <span className="flex items-center justify-center gap-2">
              <Check size={16} />
              {labels.save}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= CAMERA CAPTURE ================= */

function CameraCapture({
  onCapture,
  onClose,
  labels,
}: {
  onCapture: (dataUrl: string) => void;
  onClose: () => void;
  labels: {
    cameraTitle: string; cameraReady: string; cameraLoading: string;
    cameraError: string; cameraRetry: string; takePhoto: string;
    retakePhoto: string; useThisPhoto: string; cropCancel: string;
  };
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [status, setStatus] = useState<"loading" | "ready" | "captured" | "error">("loading");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    setStatus("loading");
    setCapturedImage(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const takeSnapshot = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/png");
    setCapturedImage(dataUrl);
    setStatus("captured");

    streamRef.current?.getTracks().forEach((t) => t.stop());
  };

  const retake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleUse = () => {
    if (capturedImage) onCapture(capturedImage);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Video size={18} className="text-[#F35403]" />
            <h3 className="text-lg font-bold text-gray-900">{labels.cameraTitle}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition">
            <X size={18} />
          </button>
        </div>

        {/* Video / Preview */}
        <div className="relative rounded-xl overflow-hidden bg-black aspect-[4/3]">
          {status === "error" ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gray-900">
              <AlertCircle size={40} className="text-red-400" />
              <p className="text-sm text-white/80">{labels.cameraError}</p>
              <button
                onClick={startCamera}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white/10 hover:bg-white/20 text-white rounded-lg transition"
              >
                <RefreshCw size={14} /> {labels.cameraRetry}
              </button>
            </div>
          ) : status === "captured" && capturedImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
          ) : (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />
              {status === "loading" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="flex items-center gap-2 text-white text-sm">
                    <Loader2 size={18} className="animate-spin" />
                    {labels.cameraLoading}
                  </div>
                </div>
              )}
              {status === "ready" && (
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-green-500/90 rounded-full">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span className="text-[10px] text-white font-medium">{labels.cameraReady}</span>
                </div>
              )}
              {/* Circular guide overlay */}
              {status === "ready" && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-52 h-52 rounded-full border-[3px] border-dashed border-white/50" />
                </div>
              )}
            </>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {status === "captured" ? (
            <>
              <button
                onClick={retake}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition"
              >
                <RefreshCw size={15} /> {labels.retakePhoto}
              </button>
              <button
                onClick={handleUse}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#F35403] rounded-xl hover:bg-[#d14a03] transition"
              >
                <Check size={15} /> {labels.useThisPhoto}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition"
              >
                {labels.cropCancel}
              </button>
              <button
                onClick={takeSnapshot}
                disabled={status !== "ready"}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#F35403] rounded-xl hover:bg-[#d14a03] disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <Camera size={15} /> {labels.takePhoto}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================= FINGERPRINT SCANNER ================= */

type FingerStatus = "idle" | "scanning" | "done";
type FingerKey = "thumb" | "index" | "middle" | "ring" | "pinky";

function FingerprintPanel({
  labels,
}: {
  labels: {
    title: string; desc: string;
    leftHand: string; rightHand: string;
    thumb: string; index: string; middle: string; ring: string; pinky: string;
    scanStart: string; scanning: string; scanComplete: string; scanNotDone: string;
  };
}) {
  const fingerNames: { key: FingerKey; label: string }[] = [
    { key: "thumb", label: labels.thumb },
    { key: "index", label: labels.index },
    { key: "middle", label: labels.middle },
    { key: "ring", label: labels.ring },
    { key: "pinky", label: labels.pinky },
  ];

  const [leftHand, setLeftHand] = useState<Record<FingerKey, FingerStatus>>({
    thumb: "idle", index: "idle", middle: "idle", ring: "idle", pinky: "idle",
  });
  const [rightHand, setRightHand] = useState<Record<FingerKey, FingerStatus>>({
    thumb: "idle", index: "idle", middle: "idle", ring: "idle", pinky: "idle",
  });

  const scanFinger = (hand: "left" | "right", finger: FingerKey) => {
    const setter = hand === "left" ? setLeftHand : setRightHand;
    setter((prev) => ({ ...prev, [finger]: "scanning" }));
    setTimeout(() => {
      setter((prev) => ({ ...prev, [finger]: "done" }));
    }, 2000);
  };

  const renderHand = (
    handLabel: string,
    handState: Record<FingerKey, FingerStatus>,
    hand: "left" | "right"
  ) => (
    <div className="flex-1">
      <p className="text-[11px] font-semibold text-gray-700 mb-3 text-center">{handLabel}</p>
      <div className="flex justify-center gap-2">
        {fingerNames.map(({ key, label }) => {
          const st = handState[key];
          return (
            <button
              key={key}
              onClick={() => st === "idle" && scanFinger(hand, key)}
              disabled={st === "scanning"}
              className="flex flex-col items-center gap-1.5 group"
              title={label}
            >
              <div
                className={`w-10 h-14 rounded-lg border-2 flex items-center justify-center transition-all ${
                  st === "done"
                    ? "border-green-500 bg-green-50"
                    : st === "scanning"
                    ? "border-[#F35403] bg-[#F35403]/10 animate-pulse"
                    : "border-gray-300 bg-gray-50 hover:border-[#F35403] hover:bg-[#F35403]/5 cursor-pointer"
                }`}
              >
                {st === "done" ? (
                  <Check size={16} className="text-green-600" />
                ) : st === "scanning" ? (
                  <Loader2 size={16} className="text-[#F35403] animate-spin" />
                ) : (
                  <Fingerprint size={16} className="text-gray-400 group-hover:text-[#F35403] transition" />
                )}
              </div>
              <span className="text-[9px] text-gray-500 leading-tight text-center">{label}</span>
              <span
                className={`text-[8px] font-medium px-1.5 py-0.5 rounded-full ${
                  st === "done"
                    ? "bg-green-100 text-green-700"
                    : st === "scanning"
                    ? "bg-orange-100 text-orange-600"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {st === "done" ? labels.scanComplete : st === "scanning" ? labels.scanning : labels.scanNotDone}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-3 bg-[#013486]/5 rounded-xl">
        <Fingerprint size={20} className="text-[#013486]" />
        <div>
          <p className="text-sm font-semibold text-gray-800">{labels.title}</p>
          <p className="text-[11px] text-gray-500">{labels.desc}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-6">
        {renderHand(labels.leftHand, leftHand, "left")}
        <div className="hidden sm:block w-px bg-gray-200" />
        {renderHand(labels.rightHand, rightHand, "right")}
      </div>
    </div>
  );
}

/* ================= FORM SECTION WRAPPER ================= */

function Section({
  icon, title, children, accent = false,
}: {
  icon: React.ReactNode; title: string; children: React.ReactNode; accent?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className={`px-5 py-3 border-b flex items-center gap-2.5 ${accent ? "bg-[#F35403]/5 border-[#F35403]/20" : "bg-gray-50/80 border-gray-100"}`}>
        <div className={accent ? "text-[#F35403]" : "text-[#013486]"}>{icon}</div>
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

/* ================= INPUT COMPONENTS ================= */

function FormInput({
  label, required, ...props
}: { label: string; required?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-gray-600 mb-1">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        {...props}
        className="w-full px-3 py-2.5 text-[13px] border border-gray-200 rounded-lg bg-gray-50/50 focus:ring-2 focus:ring-[#F35403]/30 focus:border-[#F35403] outline-none transition"
      />
    </div>
  );
}

function FormSelect({
  label, required, children, ...props
}: { label: string; required?: boolean; children: React.ReactNode } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-gray-600 mb-1">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <select
        {...props}
        className="w-full px-3 py-2.5 text-[13px] border border-gray-200 rounded-lg bg-gray-50/50 focus:ring-2 focus:ring-[#F35403]/30 focus:border-[#F35403] outline-none transition"
      >
        {children}
      </select>
    </div>
  );
}

function FormTextarea({
  label, required, ...props
}: { label: string; required?: boolean } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-gray-600 mb-1">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <textarea
        {...props}
        className="w-full px-3 py-2.5 text-[13px] border border-gray-200 rounded-lg bg-gray-50/50 focus:ring-2 focus:ring-[#F35403]/30 focus:border-[#F35403] outline-none transition resize-none"
        rows={2}
      />
    </div>
  );
}

function FileUpload({
  label, uploaded, uploadLabel, onChange,
}: {
  label: string; uploaded: boolean; uploadLabel: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="flex items-center justify-between p-3 border border-dashed border-gray-300 rounded-lg hover:border-[#F35403]/50 transition">
      <div className="flex items-center gap-2">
        <FileText size={16} className="text-gray-400" />
        <span className="text-[12px] text-gray-600">{label}</span>
      </div>
      {uploaded ? (
        <span className="text-[10px] font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center gap-1">
          <Check size={12} /> {uploadLabel}
        </span>
      ) : (
        <label className="text-[10px] font-medium text-[#F35403] bg-[#F35403]/10 px-2.5 py-1 rounded-full cursor-pointer hover:bg-[#F35403]/20 transition">
          {uploadLabel}
          <input type="file" className="hidden" onChange={onChange} accept=".pdf,.jpg,.png" />
        </label>
      )}
    </div>
  );
}

/* ================= MAIN COMPONENT ================= */

export default function AdminStudentEnrollPage() {
  const { t } = useTranslation();
  const ep = t.enrollPage;
  const router = useRouter();

  /* Photo state */
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* Documents state */
  const [docs, setDocs] = useState({ birth: false, id: false, report: false });

  const handlePhotoSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setRawImage(reader.result as string);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      setRawImage(reader.result as string);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  }, []);

  return (
    <div className="space-y-5 max-w-5xl mx-auto">

      {/* HEADER */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/admin/students")}
          className="p-2 rounded-xl border border-gray-200 hover:bg-gray-100 transition"
        >
          <ChevronLeft size={18} className="text-gray-600" />
        </button>
        <PageHeader
          title={ep.title}
          description={ep.desc}
          icon={<UserPlus size={20} />}
        />
      </div>

      {/* ======== PHOTO SECTION ======== */}
      <Section icon={<Camera size={16} />} title={ep.sectionPhoto} accent>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Photo preview */}
          <div
            className="w-40 h-40 rounded-full border-4 border-dashed border-gray-300 hover:border-[#F35403] flex items-center justify-center overflow-hidden transition-colors cursor-pointer bg-gray-50 shrink-0"
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            {croppedImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={croppedImage} alt="Student" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center p-4">
                <ImageIcon size={32} className="text-gray-300 mx-auto mb-1" />
                <p className="text-[10px] text-gray-400">{ep.dragOrClick}</p>
              </div>
            )}
          </div>

          <div className="space-y-3 text-center sm:text-left">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoSelect}
            />
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#F35403] rounded-xl hover:bg-[#d14a03] transition"
              >
                <Upload size={15} />
                {croppedImage ? ep.changePhoto : ep.uploadPhoto}
              </button>
              <button
                onClick={() => setShowCamera(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#013486] bg-[#013486]/10 border border-[#013486]/20 rounded-xl hover:bg-[#013486]/20 transition"
              >
                <Video size={15} />
                {ep.useCamera}
              </button>
            </div>
            <p className="text-[11px] text-gray-400">{ep.photoFormats}</p>
            {croppedImage && (
              <span className="inline-flex items-center gap-1 text-[11px] text-green-600 font-medium">
                <Check size={14} /> OK
              </span>
            )}
          </div>
        </div>
      </Section>

      {/* ======== PERSONAL INFO ======== */}
      <Section icon={<User size={16} />} title={ep.sectionPersonal}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormInput label={ep.firstName} required placeholder="Jean" />
          <FormInput label={ep.lastName} required placeholder="Baptiste" />
          <FormInput label={ep.dob} required type="date" />
          <FormInput label={ep.pob} placeholder="Port-au-Prince" />
          <FormSelect label={ep.gender} required>
            <option value="">&mdash;</option>
            <option value="M">{ep.genderM}</option>
            <option value="F">{ep.genderF}</option>
          </FormSelect>
          <FormInput label={ep.nationality} placeholder="Haïtienne" />
        </div>
      </Section>

      {/* ======== CONTACT ======== */}
      <Section icon={<MapPin size={16} />} title={ep.sectionContact}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormInput label={ep.phone} type="tel" placeholder="509-XXXX-XXXX" />
          <FormInput label={ep.email} type="email" placeholder="eleve@email.com" />
          <FormInput label={ep.city} placeholder="Port-au-Prince" />
          <div className="sm:col-span-2 lg:col-span-3">
            <FormTextarea label={ep.address} placeholder="Rue, quartier, commune..." />
          </div>
        </div>
      </Section>

      {/* ======== FAMILY ======== */}
      <Section icon={<Users size={16} />} title={ep.sectionFamily}>
        <div className="space-y-5">
          {/* Father */}
          <div>
            <p className="text-[11px] font-semibold text-[#013486] mb-3 uppercase tracking-wide">{ep.fatherName.split(" ")[0]}</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormInput label={ep.fatherName} placeholder="Nom complet" />
              <FormInput label={ep.fatherPhone} type="tel" placeholder="509-XXXX-XXXX" />
              <FormInput label={ep.fatherJob} placeholder="Profession" />
            </div>
          </div>
          {/* Mother */}
          <div>
            <p className="text-[11px] font-semibold text-[#013486] mb-3 uppercase tracking-wide">{ep.motherName.split(" ")[0]}</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormInput label={ep.motherName} placeholder="Nom complet" />
              <FormInput label={ep.motherPhone} type="tel" placeholder="509-XXXX-XXXX" />
              <FormInput label={ep.motherJob} placeholder="Profession" />
            </div>
          </div>
          {/* Guardian */}
          <div>
            <p className="text-[11px] font-semibold text-[#F35403] mb-3 uppercase tracking-wide">{ep.guardianName.split("/")[0]}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <FormInput label={ep.guardianName} placeholder="Nom complet" />
              <FormInput label={ep.guardianPhone} type="tel" placeholder="509-XXXX-XXXX" />
              <FormInput label={ep.guardianEmail} type="email" placeholder="email@email.com" />
              <FormInput label={ep.guardianRelation} placeholder="Oncle, tante..." />
            </div>
          </div>
        </div>
      </Section>

      {/* ======== ACADEMIC ======== */}
      <Section icon={<FileText size={16} />} title={ep.sectionAcademic}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormSelect label={ep.classLabel} required>
            <option value="">&mdash;</option>
            <option value="NS1">NS1</option>
            <option value="NS2">NS2</option>
            <option value="NS3">NS3</option>
            <option value="NS4">NS4</option>
          </FormSelect>
          <FormInput label={ep.schoolYear} placeholder="2025-2026" />
          <FormInput label={ep.enrollDate} type="date" />
          <FormInput label={ep.previousSchool} placeholder="Nom de l'ancienne école" />
          <div>
            <FormInput label={ep.studentCode} value="ED-01221" readOnly />
            <p className="text-[10px] text-gray-400 mt-1">{ep.autoGenerated}</p>
          </div>
        </div>
      </Section>

      {/* ======== MEDICAL ======== */}
      <Section icon={<Heart size={16} />} title={ep.sectionMedical}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormSelect label={ep.bloodType}>
            <option value="">&mdash;</option>
            <option>A+</option><option>A-</option>
            <option>B+</option><option>B-</option>
            <option>AB+</option><option>AB-</option>
            <option>O+</option><option>O-</option>
          </FormSelect>
          <FormInput label={ep.emergencyName} required placeholder="Nom du contact" />
          <FormInput label={ep.emergencyPhone} required type="tel" placeholder="509-XXXX-XXXX" />
          <div className="sm:col-span-2 lg:col-span-3">
            <FormTextarea label={ep.allergies} placeholder={ep.none} />
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <FormTextarea label={ep.conditions} placeholder={ep.none} />
          </div>
        </div>
      </Section>

      {/* ======== DOCUMENTS ======== */}
      <Section icon={<FileText size={16} />} title={ep.sectionDocuments}>
        <div className="space-y-3">
          <FileUpload
            label={ep.birthCertificate}
            uploaded={docs.birth}
            uploadLabel={docs.birth ? ep.uploaded : ep.uploadDoc}
            onChange={() => setDocs((d) => ({ ...d, birth: true }))}
          />
          <FileUpload
            label={ep.idCard}
            uploaded={docs.id}
            uploadLabel={docs.id ? ep.uploaded : ep.uploadDoc}
            onChange={() => setDocs((d) => ({ ...d, id: true }))}
          />
          <FileUpload
            label={ep.previousReport}
            uploaded={docs.report}
            uploadLabel={docs.report ? ep.uploaded : ep.uploadDoc}
            onChange={() => setDocs((d) => ({ ...d, report: true }))}
          />
        </div>
      </Section>

      {/* ======== FINGERPRINT ======== */}
      <Section icon={<Fingerprint size={16} />} title={ep.sectionBiometric} accent>
        <FingerprintPanel labels={ep} />
      </Section>

      {/* ======== ACTION BUTTONS ======== */}
      <div className="flex flex-col sm:flex-row gap-3 pb-8">
        <button
          onClick={() => router.push("/admin/students")}
          className="flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition"
        >
          <ChevronLeft size={16} />
          {t.common.back}
        </button>
        <button className="flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium text-[#013486] bg-[#013486]/10 rounded-xl hover:bg-[#013486]/20 transition">
          <Save size={16} />
          {ep.saveDraft}
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#F35403] rounded-xl hover:bg-[#d14a03] shadow-md hover:shadow-lg transition-all">
          <Check size={16} />
          {ep.submit}
        </button>
      </div>

      {/* CROPPER MODAL */}
      {showCropper && rawImage && (
        <PhotoCropper
          imageSrc={rawImage}
          labels={{
            title: ep.cropTitle, zoom: ep.zoom, rotate: ep.rotate,
            save: ep.cropSave, cancel: ep.cropCancel,
          }}
          onSave={(data) => {
            setCroppedImage(data);
            setShowCropper(false);
          }}
          onCancel={() => setShowCropper(false)}
        />
      )}

      {/* CAMERA MODAL */}
      {showCamera && (
        <CameraCapture
          labels={ep}
          onCapture={(dataUrl) => {
            setShowCamera(false);
            setRawImage(dataUrl);
            setShowCropper(true);
          }}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
}
