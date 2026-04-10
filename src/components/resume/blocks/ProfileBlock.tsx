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

const ASPECT_RATIO = 6 / 5; // 高宽比 6:5（2寸证件照比例）
const MIN_SIZE = 60;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const CONTAINER_SIZE = 300; // 减小到 300，更适合移动端
const INITIAL_CROP_WIDTH = 150;
const INITIAL_CROP_HEIGHT = INITIAL_CROP_WIDTH * ASPECT_RATIO;

export function ProfileBlockEditor({ data }: ProfileBlockProps) {
  const { updateContent } = useResumeStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    data.photo ? data.photo : null
  );
  const [isCropping, setIsCropping] = useState(false);
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [cropArea, setCropArea] = useState<CropArea>({ 
    x: (CONTAINER_SIZE - INITIAL_CROP_WIDTH) / 2, 
    y: (CONTAINER_SIZE - INITIAL_CROP_HEIGHT) / 2, 
    width: INITIAL_CROP_WIDTH, 
    height: INITIAL_CROP_HEIGHT 
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const isResizingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, cropX: 0, cropY: 0, cropW: 0, cropH: 0 });
  const lastTouchDistanceRef = useRef(0);

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
      setCropArea({ 
        x: (CONTAINER_SIZE - INITIAL_CROP_WIDTH) / 2, 
        y: (CONTAINER_SIZE - INITIAL_CROP_HEIGHT) / 2, 
        width: INITIAL_CROP_WIDTH, 
        height: INITIAL_CROP_HEIGHT 
      });
      setIsCropping(true);
    };
    reader.onerror = () => {
      toast.error('读取图片失败，请重试');
    };
    reader.readAsDataURL(file);
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const resizeHandleSize = 12;
    const isBottomRight = 
      mx >= cropArea.x + cropArea.width - resizeHandleSize &&
      mx <= cropArea.x + cropArea.width &&
      my >= cropArea.y + cropArea.height - resizeHandleSize &&
      my <= cropArea.y + cropArea.height;

    if (isBottomRight) {
      isResizingRef.current = true;
      dragStartRef.current = { x: mx, y: my, cropX: cropArea.x, cropY: cropArea.y, cropW: cropArea.width, cropH: cropArea.height };
    } else if (mx >= cropArea.x && mx <= cropArea.x + cropArea.width &&
        my >= cropArea.y && my <= cropArea.y + cropArea.height) {
      isDraggingRef.current = true;
      dragStartRef.current = { x: mx, y: my, cropX: cropArea.x, cropY: cropArea.y, cropW: cropArea.width, cropH: cropArea.height };
    }
  }, [cropArea]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!containerRef.current) return;
    
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch1.clientX - touch2.clientX, 2) +
        Math.pow(touch1.clientY - touch2.clientY, 2)
      );
      lastTouchDistanceRef.current = distance;
      isResizingRef.current = true;
      isDraggingRef.current = false;
      dragStartRef.current = { x: 0, y: 0, cropX: cropArea.x, cropY: cropArea.y, cropW: cropArea.width, cropH: cropArea.height };
    } else if (e.touches.length === 1) {
      const touch = e.touches[0];
      const rect = containerRef.current.getBoundingClientRect();
      const mx = touch.clientX - rect.left;
      const my = touch.clientY - rect.top;

      if (mx >= cropArea.x && mx <= cropArea.x + cropArea.width &&
          my >= cropArea.y && my <= cropArea.y + cropArea.height) {
        isDraggingRef.current = true;
        isResizingRef.current = false;
        dragStartRef.current = { x: mx, y: my, cropX: cropArea.x, cropY: cropArea.y, cropW: cropArea.width, cropH: cropArea.height };
      }
    }
  }, [cropArea]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    if (isDraggingRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const deltaX = mx - dragStartRef.current.x;
      const deltaY = my - dragStartRef.current.y;

      let newX = dragStartRef.current.cropX + deltaX;
      let newY = dragStartRef.current.cropY + deltaY;

      newX = Math.max(0, Math.min(newX, CONTAINER_SIZE - cropArea.width));
      newY = Math.max(0, Math.min(newY, CONTAINER_SIZE - cropArea.height));

      setCropArea(prev => ({ ...prev, x: newX, y: newY }));
    } else if (isResizingRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const deltaX = mx - dragStartRef.current.x;
      const deltaY = my - dragStartRef.current.y;

      const newWidth = Math.max(MIN_SIZE, dragStartRef.current.cropW + deltaX);
      const newHeight = newWidth * ASPECT_RATIO;

      const maxWidth = CONTAINER_SIZE - dragStartRef.current.cropX;
      const maxHeight = CONTAINER_SIZE - dragStartRef.current.cropY;
      const constrainedWidth = Math.min(newWidth, maxWidth, maxHeight / ASPECT_RATIO);
      const constrainedHeight = constrainedWidth * ASPECT_RATIO;

      setCropArea(prev => ({ 
        ...prev, 
        width: constrainedWidth, 
        height: constrainedHeight 
      }));
    }
  }, [cropArea.width, cropArea.height]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!containerRef.current) return;
    
    if (e.touches.length === 2 && isResizingRef.current) {
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch1.clientX - touch2.clientX, 2) +
        Math.pow(touch1.clientY - touch2.clientY, 2)
      );
      
      const scale = distance / lastTouchDistanceRef.current;
      const newWidth = Math.max(MIN_SIZE, dragStartRef.current.cropW * scale);
      const newHeight = newWidth * ASPECT_RATIO;

      const maxWidth = CONTAINER_SIZE - dragStartRef.current.cropX;
      const maxHeight = CONTAINER_SIZE - dragStartRef.current.cropY;
      const constrainedWidth = Math.min(newWidth, maxWidth, maxHeight / ASPECT_RATIO);
      const constrainedHeight = constrainedWidth * ASPECT_RATIO;

      const centerX = dragStartRef.current.cropX + dragStartRef.current.cropW / 2;
      const centerY = dragStartRef.current.cropY + dragStartRef.current.cropH / 2;
      
      const newX = centerX - constrainedWidth / 2;
      const newY = centerY - constrainedHeight / 2;
      
      const constrainedX = Math.max(0, Math.min(newX, CONTAINER_SIZE - constrainedWidth));
      const constrainedY = Math.max(0, Math.min(newY, CONTAINER_SIZE - constrainedHeight));

      setCropArea(prev => ({ 
        ...prev, 
        x: constrainedX,
        y: constrainedY,
        width: constrainedWidth, 
        height: constrainedHeight 
      }));
      
      lastTouchDistanceRef.current = distance;
    } else if (e.touches.length === 1 && isDraggingRef.current) {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = containerRef.current.getBoundingClientRect();
      const mx = touch.clientX - rect.left;
      const my = touch.clientY - rect.top;

      const deltaX = mx - dragStartRef.current.x;
      const deltaY = my - dragStartRef.current.y;

      let newX = dragStartRef.current.cropX + deltaX;
      let newY = dragStartRef.current.cropY + deltaY;

      newX = Math.max(0, Math.min(newX, CONTAINER_SIZE - cropArea.width));
      newY = Math.max(0, Math.min(newY, CONTAINER_SIZE - cropArea.height));

      setCropArea(prev => ({ ...prev, x: newX, y: newY }));
    }
  }, [cropArea]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!containerRef.current) return;
    e.preventDefault();
    
    const rect = containerRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    if (mx >= cropArea.x - 20 && mx <= cropArea.x + cropArea.width + 20 &&
        my >= cropArea.y - 20 && my <= cropArea.y + cropArea.height + 20) {
      const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
      const newWidth = Math.max(MIN_SIZE, Math.min(cropArea.width * scaleFactor, CONTAINER_SIZE - cropArea.x));
      const newHeight = newWidth * ASPECT_RATIO;
      
      const centerX = cropArea.x + cropArea.width / 2;
      const centerY = cropArea.y + cropArea.height / 2;
      
      const newX = centerX - newWidth / 2;
      const newY = centerY - newHeight / 2;
      
      const constrainedX = Math.max(0, Math.min(newX, CONTAINER_SIZE - newWidth));
      const constrainedY = Math.max(0, Math.min(newY, CONTAINER_SIZE - newHeight));
      
      setCropArea(prev => ({ 
        ...prev, 
        x: constrainedX,
        y: constrainedY,
        width: newWidth, 
        height: newHeight 
      }));
    }
  }, [cropArea]);

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
    isResizingRef.current = false;
  }, []);

  const handleTouchEnd = useCallback(() => {
    isDraggingRef.current = false;
    isResizingRef.current = false;
  }, []);

  const handleTouchCancel = useCallback(() => {
    isDraggingRef.current = false;
    isResizingRef.current = false;
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const getPosFromEvent = (clientX: number, clientY: number) => {
      const rect = container.getBoundingClientRect();
      return { mx: clientX - rect.left, my: clientY - rect.top };
    };

    const onMouseDown = (e: MouseEvent) => {
      const { mx, my } = getPosFromEvent(e.clientX, e.clientY);
      const resizeHandleSize = 16;

      const isBottomRight =
        mx >= cropArea.x + cropArea.width - resizeHandleSize &&
        mx <= cropArea.x + cropArea.width &&
        my >= cropArea.y + cropArea.height - resizeHandleSize &&
        my <= cropArea.y + cropArea.height;

      if (isBottomRight) {
        isResizingRef.current = true;
        dragStartRef.current = { x: mx, y: my, cropX: cropArea.x, cropY: cropArea.y, cropW: cropArea.width, cropH: cropArea.height };
      } else if (mx >= cropArea.x && mx <= cropArea.x + cropArea.width &&
          my >= cropArea.y && my <= cropArea.y + cropArea.height) {
        isDraggingRef.current = true;
        dragStartRef.current = { x: mx, y: my, cropX: cropArea.x, cropY: cropArea.y, cropW: cropArea.width, cropH: cropArea.height };
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current && !isResizingRef.current) return;
      const { mx, my } = getPosFromEvent(e.clientX, e.clientY);

      if (isDraggingRef.current) {
        const deltaX = mx - dragStartRef.current.x;
        const deltaY = my - dragStartRef.current.y;
        let newX = Math.max(0, Math.min(dragStartRef.current.cropX + deltaX, CONTAINER_SIZE - cropArea.width));
        let newY = Math.max(0, Math.min(dragStartRef.current.cropY + deltaY, CONTAINER_SIZE - cropArea.height));
        setCropArea(prev => ({ ...prev, x: newX, y: newY }));
      } else if (isResizingRef.current) {
        const newWidth = Math.max(MIN_SIZE, dragStartRef.current.cropW + (mx - dragStartRef.current.x));
        const newHeight = newWidth * ASPECT_RATIO;
        const maxWidth = CONTAINER_SIZE - dragStartRef.current.cropX;
        const maxHeight = CONTAINER_SIZE - dragStartRef.current.cropY;
        const constrainedWidth = Math.min(newWidth, maxWidth, maxHeight / ASPECT_RATIO);
        setCropArea(prev => ({ ...prev, width: constrainedWidth, height: constrainedWidth * ASPECT_RATIO }));
      }
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
      isResizingRef.current = false;
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const t1 = e.touches[0], t2 = e.touches[1];
        lastTouchDistanceRef.current = Math.sqrt(Math.pow(t1.clientX - t2.clientX, 2) + Math.pow(t1.clientY - t2.clientY, 2));
        isResizingRef.current = true;
        isDraggingRef.current = false;
        dragStartRef.current = { x: 0, y: 0, cropX: cropArea.x, cropY: cropArea.y, cropW: cropArea.width, cropH: cropArea.height };
      } else if (e.touches.length === 1) {
        const { mx, my } = getPosFromEvent(e.touches[0].clientX, e.touches[0].clientY);
        const resizeHandleSize = 28;
        
        const isBottomRight =
          mx >= cropArea.x + cropArea.width - resizeHandleSize &&
          mx <= cropArea.x + cropArea.width + 4 &&
          my >= cropArea.y + cropArea.height - resizeHandleSize &&
          my <= cropArea.y + cropArea.height + 4;

        if (isBottomRight) {
          isResizingRef.current = true;
          isDraggingRef.current = false;
          dragStartRef.current = { x: mx, y: my, cropX: cropArea.x, cropY: cropArea.y, cropW: cropArea.width, cropH: cropArea.height };
        } else if (mx >= cropArea.x && mx <= cropArea.x + cropArea.width && my >= cropArea.y && my <= cropArea.y + cropArea.height) {
          isDraggingRef.current = true;
          isResizingRef.current = false;
          dragStartRef.current = { x: mx, y: my, cropX: cropArea.x, cropY: cropArea.y, cropW: cropArea.width, cropH: cropArea.height };
        }
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current && !isResizingRef.current) return;
      e.preventDefault();

      if (e.touches.length === 2 && isResizingRef.current) {
        const t1 = e.touches[0], t2 = e.touches[1];
        const distance = Math.sqrt(Math.pow(t1.clientX - t2.clientX, 2) + Math.pow(t1.clientY - t2.clientY, 2));
        const scale = Math.max(0.5, Math.min(2, distance / lastTouchDistanceRef.current));
        const newWidth = Math.max(MIN_SIZE, dragStartRef.current.cropW * scale);
        const newHeight = newWidth * ASPECT_RATIO;
        const maxWidth = CONTAINER_SIZE - dragStartRef.current.cropX;
        const maxHeight = CONTAINER_SIZE - dragStartRef.current.cropY;
        const cw = Math.min(newWidth, maxWidth, maxHeight / ASPECT_RATIO);
        const ch = cw * ASPECT_RATIO;
        const cx = dragStartRef.current.cropX + dragStartRef.current.cropW / 2;
        const cy = dragStartRef.current.cropY + dragStartRef.current.cropH / 2;
        setCropArea(prev => ({
          ...prev,
          x: Math.max(0, Math.min(cx - cw / 2, CONTAINER_SIZE - cw)),
          y: Math.max(0, Math.min(cy - ch / 2, CONTAINER_SIZE - ch)),
          width: cw,
          height: ch,
        }));
        lastTouchDistanceRef.current = distance;
      } else if (e.touches.length === 1) {
        const { mx, my } = getPosFromEvent(e.touches[0].clientX, e.touches[0].clientY);

        if (isResizingRef.current) {
          const newWidth = Math.max(MIN_SIZE, dragStartRef.current.cropW + (mx - dragStartRef.current.x));
          const newHeight = newWidth * ASPECT_RATIO;
          const maxWidth = CONTAINER_SIZE - dragStartRef.current.cropX;
          const maxHeight = CONTAINER_SIZE - dragStartRef.current.cropY;
          const cw = Math.min(newWidth, maxWidth, maxHeight / ASPECT_RATIO);
          setCropArea(prev => ({ ...prev, width: cw, height: cw * ASPECT_RATIO }));
        } else if (isDraggingRef.current) {
          const dx = mx - dragStartRef.current.x;
          const dy = my - dragStartRef.current.y;
          setCropArea(prev => ({
            ...prev,
            x: Math.max(0, Math.min(dragStartRef.current.cropX + dx, CONTAINER_SIZE - prev.width)),
            y: Math.max(0, Math.min(dragStartRef.current.cropY + dy, CONTAINER_SIZE - prev.height)),
          }));
        }
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const { mx, my } = getPosFromEvent(e.clientX, e.clientY);
      if (mx < cropArea.x - 20 || mx > cropArea.x + cropArea.width + 20 ||
          my < cropArea.y - 20 || my > cropArea.y + cropArea.height + 20) return;

      const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
      const nw = Math.max(MIN_SIZE, Math.min(cropArea.width * scaleFactor, CONTAINER_SIZE - cropArea.x));
      const nh = nw * ASPECT_RATIO;
      const cx = cropArea.x + cropArea.width / 2;
      const cy = cropArea.y + cropArea.height / 2;
      setCropArea(prev => ({
        ...prev,
        x: Math.max(0, Math.min(cx - nw / 2, CONTAINER_SIZE - nw)),
        y: Math.max(0, Math.min(cy - nh / 2, CONTAINER_SIZE - nh)),
        width: nw,
        height: nh,
      }));
    };

    container.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    container.addEventListener("touchstart", onTouchStart, { passive: true });
    container.addEventListener("touchmove", onTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });
    container.addEventListener("touchcancel", handleTouchCancel, { passive: true });
    container.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      container.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      container.removeEventListener("touchstart", onTouchStart);
      container.removeEventListener("touchmove", onTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
      container.removeEventListener("touchcancel", handleTouchCancel);
      container.removeEventListener("wheel", onWheel);
    };
  }, [cropArea, handleTouchEnd, handleTouchCancel]);

  const applyCrop = useCallback(() => {
    if (!cropImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = cropImage;
    img.onload = () => {
      const OUTPUT_WIDTH = 400;
      const OUTPUT_HEIGHT = Math.round(OUTPUT_WIDTH * ASPECT_RATIO);
      canvas.width = OUTPUT_WIDTH;
      canvas.height = OUTPUT_HEIGHT;

      const scaleX = img.width / CONTAINER_SIZE;
      const scaleY = img.height / CONTAINER_SIZE;
      const sx = cropArea.x * scaleX;
      const sy = cropArea.y * scaleY;
      const sWidth = cropArea.width * scaleX;
      const sHeight = cropArea.height * scaleY;

      ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);
      const croppedBase64 = canvas.toDataURL('image/jpeg', 0.92);

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
          <p className="text-xs text-gray-500">鼠标滚轮缩放 / 双指缩放 / 拖拽右下角调整大小</p>
          <div
            ref={containerRef}
            className="relative bg-gray-100 overflow-hidden select-none rounded-xl"
            style={{ 
              width: CONTAINER_SIZE, 
              height: CONTAINER_SIZE,
              touchAction: "none",
              WebkitTouchCallout: "none",
            }}
          >
            <img
              src={cropImage || ''}
              alt="裁剪预览"
              className="w-full h-full object-cover pointer-events-none"
            />
            <div
              className="absolute border-2 border-white shadow-lg bg-black/20 cursor-move"
              style={{
                left: cropArea.x,
                top: cropArea.y,
                width: cropArea.width,
                height: cropArea.height,
              }}
            >
              <div 
                className="absolute bottom-0 right-0 w-6 h-6 bg-white border-2 border-gray-800 cursor-se-resize z-10"
                style={{ marginBottom: '-4px', marginRight: '-4px' }}
              />
            </div>
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
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
          <div className="flex-1 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
              <div className="col-span-1 sm:col-span-2">
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

          <div className="flex flex-col items-center space-y-2 sm:self-start">
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
                    setCropArea({ 
                      x: (CONTAINER_SIZE - INITIAL_CROP_WIDTH) / 2, 
                      y: (CONTAINER_SIZE - INITIAL_CROP_HEIGHT) / 2, 
                      width: INITIAL_CROP_WIDTH, 
                      height: INITIAL_CROP_HEIGHT 
                    });
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
