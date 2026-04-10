"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ProfileBlock as ProfileBlockType } from "@/lib/resume/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useResumeStore } from "@/stores/resume";
import { Camera, Crop, X } from "lucide-react";
import { toast } from "sonner";

interface ProfileBlockProps {
  data: ProfileBlockType;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

type ResizeHandle = "tl" | "tr" | "bl" | "br" | null;

const ASPECT_RATIO = 5 / 6;
const MIN_SIZE = 30;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export function ProfileBlockEditor({ data }: ProfileBlockProps) {
  const { updateContent } = useResumeStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    data.photo ? data.photo : null
  );
  const [isCropping, setIsCropping] = useState(false);
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 100, height: 120 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const isResizingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, cropX: 0, cropY: 0 });
  const resizeStartRef = useRef({ x: 0, y: 0, cropX: 0, cropY: 0, cropW: 0, cropH: 0 });
  const resizeHandleRef = useRef<ResizeHandle>(null);

  const [localName, setLocalName] = useState(data.name);
  const [localTitle, setLocalTitle] = useState(data.title);
  const [localEmail, setLocalEmail] = useState(data.email);
  const [localPhone, setLocalPhone] = useState(data.phone);
  const [localLocation, setLocalLocation] = useState(data.location);

  useEffect(() => {
    setPhotoPreview(data.photo ? data.photo : null);
  }, [data.photo]);

  useEffect(() => {
    setLocalName(data.name);
    setLocalTitle(data.title);
    setLocalEmail(data.email);
    setLocalPhone(data.phone);
    setLocalLocation(data.location);
  }, [data.name, data.title, data.email, data.phone, data.location]);

  const handleChange = (field: keyof ProfileBlockType, value: string, localSetter: (v: string) => void) => {
    localSetter(value);
  };

  const handleBlur = (field: keyof ProfileBlockType, value: string) => {
    if (data[field] !== value) {
      updateContent({
        profile: { ...data, [field]: value },
      });
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error('只支持 JPG、PNG、WebP 格式的图片');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error('图片大小不能超过 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (!base64.startsWith('data:image/')) {
        toast.error('无效的图片文件');
        return;
      }
      setCropImage(base64);
      setCropArea({ x: 0, y: 0, width: 100, height: 120 });
      setIsCropping(true);
    };
    reader.onerror = () => {
      toast.error('读取图片失败，请重试');
    };
    reader.readAsDataURL(file);
  };

  const getHandleAt = (mx: number, my: number, ca: CropArea): ResizeHandle => {
    const HANDLE = 8;
    const { x, y, width, height } = ca;
    if (mx >= x - HANDLE && mx <= x + HANDLE && my >= y - HANDLE && my <= y + HANDLE) return "tl";
    if (mx >= x + width - HANDLE && mx <= x + width + HANDLE && my >= y - HANDLE && my <= y + HANDLE) return "tr";
    if (mx >= x - HANDLE && mx <= x + HANDLE && my >= y + height - HANDLE && my <= y + height + HANDLE) return "bl";
    if (mx >= x + width - HANDLE && mx <= x + width + HANDLE && my >= y + height - HANDLE && my <= y + height + HANDLE) return "br";
    return null;
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const handle = getHandleAt(mx, my, cropArea);
    if (handle) {
      isResizingRef.current = true;
      resizeHandleRef.current = handle;
      resizeStartRef.current = {
        x: mx, y: my,
        cropX: cropArea.x, cropY: cropArea.y,
        cropW: cropArea.width, cropH: cropArea.height,
      };
      return;
    }

    if (mx >= cropArea.x && mx <= cropArea.x + cropArea.width &&
        my >= cropArea.y && my <= cropArea.y + cropArea.height) {
      isDraggingRef.current = true;
      dragStartRef.current = { x: mx, y: my, cropX: cropArea.x, cropY: cropArea.y };
    }
  }, [cropArea]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    if (isResizingRef.current && resizeHandleRef.current && containerRef.current) {
      const start = resizeStartRef.current;
      const containerW = containerRef.current.offsetWidth;
      const containerH = containerRef.current.offsetHeight;
      let dx = mx - start.x;
      let dy = my - start.y;

      let newX = start.cropX;
      let newY = start.cropY;
      let newW = start.cropW;
      let newH = start.cropH;

      const handle = resizeHandleRef.current;

      if (handle === "br") {
        newW = Math.max(MIN_SIZE, Math.min(start.cropW + dx, containerW - start.cropX));
        newH = newW / ASPECT_RATIO;
        if (newY + newH > containerH) {
          newH = containerH - newY;
          newW = newH * ASPECT_RATIO;
        }
      } else if (handle === "bl") {
        newW = Math.max(MIN_SIZE, Math.min(start.cropW - dx, start.cropX + start.cropW));
        newX = start.cropX + start.cropW - newW;
        newH = newW / ASPECT_RATIO;
        newY = start.cropY + start.cropH - newH;
        if (newY < 0) {
          newY = 0;
          newH = Math.max(MIN_SIZE, start.cropY + start.cropH);
          newW = newH * ASPECT_RATIO;
          newX = start.cropX + start.cropW - newW;
        }
      } else if (handle === "tr") {
        newW = Math.max(MIN_SIZE, Math.min(start.cropW + dx, containerW - start.cropX));
        newH = newW / ASPECT_RATIO;
        newY = start.cropY + start.cropH - newH;
        if (newY < 0) {
          newY = 0;
          newH = Math.max(MIN_SIZE, start.cropY + start.cropH);
          newW = newH * ASPECT_RATIO;
        }
      } else if (handle === "tl") {
        newW = Math.max(MIN_SIZE, Math.min(start.cropW - dx, start.cropX + start.cropW));
        newX = start.cropX + start.cropW - newW;
        newH = newW / ASPECT_RATIO;
        newY = start.cropY + start.cropH - newH;
        if (newY < 0 || newX < 0) {
          newY = Math.max(0, newY);
          newX = Math.max(0, newX);
          newH = Math.max(MIN_SIZE, newH);
          newW = newH * ASPECT_RATIO;
        }
      }

      setCropArea({ x: newX, y: newY, width: newW, height: newH });
      return;
    }

    if (!isDraggingRef.current) return;
    const deltaX = mx - dragStartRef.current.x;
    const deltaY = my - dragStartRef.current.y;

    let newX = dragStartRef.current.cropX + deltaX;
    let newY = dragStartRef.current.cropY + deltaY;

    newX = Math.max(0, Math.min(newX, (containerRef.current?.offsetWidth || 200) - cropArea.width));
    newY = Math.max(0, Math.min(newY, (containerRef.current?.offsetHeight || 200) - cropArea.height));

    setCropArea(prev => ({ ...prev, x: newX, y: newY }));
  }, [cropArea.width, cropArea.height]);

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
    isResizingRef.current = false;
    resizeHandleRef.current = null;
  }, []);

  const applyCrop = useCallback(() => {
    if (!cropImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = cropImage;
    img.onload = () => {
      canvas.width = 200;
      canvas.height = 240;

      const scaleX = img.width / 200;
      const scaleY = img.height / 200;
      const sx = cropArea.x * scaleX;
      const sy = cropArea.y * scaleY;
      const sWidth = cropArea.width * scaleX;
      const sHeight = cropArea.height * scaleY;

      ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, 200, 240);
      const croppedBase64 = canvas.toDataURL('image/jpeg', 0.85);

      setPhotoPreview(croppedBase64);
      setIsCropping(false);
      setCropImage(null);

      updateContent({
        profile: { ...data, photo: croppedBase64 },
      });
    };
  }, [cropImage, cropArea, data, updateContent]);

  const cancelCrop = () => {
    setIsCropping(false);
    setCropImage(null);
  };

  const getCursor = useCallback((mx: number, my: number) => {
    if (isDraggingRef.current || isResizingRef.current) return "grabbing";
    const handle = getHandleAt(mx, my, cropArea);
    if (handle === "tl" || handle === "br") return "nwse-resize";
    if (handle === "tr" || handle === "bl") return "nesw-resize";
    if (mx >= cropArea.x && mx <= cropArea.x + cropArea.width &&
        my >= cropArea.y && my <= cropArea.y + cropArea.height) return "grab";
    return "crosshair";
  }, [cropArea]);

  const [cursor, setCursor] = useState("crosshair");

  const handleMouseMoveForCursor = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    setCursor(getCursor(mx, my));
    handleMouseMove(e);
  }, [handleMouseMove, getCursor]);

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900">个人信息</h3>

      {isCropping ? (
        <div className="flex flex-col items-center gap-4 p-4 rounded-3xl" style={{ 
          background: "rgba(255, 255, 255, 0.55)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 154, 158, 0.2)",
        }}>
          <p className="text-sm text-gray-600">拖动框选区域进行裁剪（2寸证件照比例 5:6）</p>
          <div
            ref={containerRef}
            className="relative w-[200px] h-[200px] bg-gray-100 overflow-hidden select-none rounded-xl"
            style={{ cursor }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMoveForCursor}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <img
              src={cropImage || ''}
              alt="裁剪预览"
              className="w-full h-full object-cover pointer-events-none"
            />
            <div
              className="absolute border-2 border-white shadow-lg bg-black/20"
              style={{
                left: cropArea.x,
                top: cropArea.y,
                width: cropArea.width,
                height: cropArea.height,
              }}
            />
            {(["tl", "tr", "bl", "br"] as const).map((pos) => {
              const style: React.CSSProperties = {
                position: "absolute",
                width: 10,
                height: 10,
                background: "white",
                border: "1px solid #666",
                borderRadius: 2,
              };
              if (pos === "tl") { style.left = cropArea.x - 5; style.top = cropArea.y - 5; }
              if (pos === "tr") { style.right = 200 - cropArea.x - cropArea.width - 5; style.top = cropArea.y - 5; }
              if (pos === "bl") { style.left = cropArea.x - 5; style.bottom = 200 - cropArea.y - cropArea.height - 5; }
              if (pos === "br") { style.right = 200 - cropArea.x - cropArea.width - 5; style.bottom = 200 - cropArea.y - cropArea.height - 5; }
              return <div key={pos} style={style} />;
            })}
          </div>
          <canvas ref={canvasRef} className="hidden" />
          <div className="flex gap-2">
            <Button onClick={applyCrop} size="sm">确认裁剪</Button>
            <Button variant="outline" onClick={cancelCrop} size="sm"
              style={{ 
                background: "rgba(255, 255, 255, 0.5)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                borderColor: "rgba(255, 154, 158, 0.3)",
              }}
            >
              <X className="h-4 w-4 mr-1" />
              取消
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-6">
          <div className="flex-1 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600 mb-2 block">姓名</label>
                <Input
                  value={localName}
                  onChange={(e) => handleChange("name", e.target.value, setLocalName)}
                  onBlur={(e) => handleBlur("name", e.target.value)}
                  placeholder="张三"
                  style={{ 
                    background: "rgba(255, 255, 255, 0.6)",
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                    borderColor: "rgba(255, 154, 158, 0.25)",
                  }}
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-2 block">求职意向</label>
                <Input
                  value={localTitle}
                  onChange={(e) => handleChange("title", e.target.value, setLocalTitle)}
                  onBlur={(e) => handleBlur("title", e.target.value)}
                  placeholder="前端开发工程师"
                  style={{ 
                    background: "rgba(255, 255, 255, 0.6)",
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                    borderColor: "rgba(255, 154, 158, 0.25)",
                  }}
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-2 block">邮箱</label>
                <Input
                  type="email"
                  value={localEmail}
                  onChange={(e) => handleChange("email", e.target.value, setLocalEmail)}
                  onBlur={(e) => handleBlur("email", e.target.value)}
                  placeholder="zhangsan@example.com"
                  style={{ 
                    background: "rgba(255, 255, 255, 0.6)",
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                    borderColor: "rgba(255, 154, 158, 0.25)",
                  }}
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-2 block">电话</label>
                <Input
                  value={localPhone}
                  onChange={(e) => handleChange("phone", e.target.value, setLocalPhone)}
                  onBlur={(e) => handleBlur("phone", e.target.value)}
                  placeholder="138-0000-0000"
                  style={{ 
                    background: "rgba(255, 255, 255, 0.6)",
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                    borderColor: "rgba(255, 154, 158, 0.25)",
                  }}
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm text-gray-600 mb-2 block">所在城市</label>
                <Input
                  value={localLocation}
                  onChange={(e) => handleChange("location", e.target.value, setLocalLocation)}
                  onBlur={(e) => handleBlur("location", e.target.value)}
                  placeholder="北京"
                  style={{ 
                    background: "rgba(255, 255, 255, 0.6)",
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                    borderColor: "rgba(255, 154, 158, 0.25)",
                  }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center space-y-2">
            <div
              className="w-32 h-40 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-all overflow-hidden"
              style={{ 
                background: "rgba(255, 255, 255, 0.4)",
                border: "2px dashed rgba(255, 154, 158, 0.35)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)"
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="证件照"
                  className="w-full h-full object-cover"
                />
              ) : (
                <>
                  <Camera className="h-8 w-8 text-gray-400" />
                  <span className="text-xs text-gray-500 mt-1">点击上传</span>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
            {photoPreview ? (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCropImage(photoPreview);
                    setCropArea({ x: 0, y: 0, width: 100, height: 120 });
                    setIsCropping(true);
                  }}
                  className="text-xs"
                >
                  <Crop className="h-3 w-3 mr-1" />
                  裁剪
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setPhotoPreview(null);
                    updateContent({
                      profile: { ...data, photo: "" },
                    });
                  }}
                  className="text-xs text-red-500"
                >
                  <X className="h-3 w-3 mr-1" />
                  删除
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
