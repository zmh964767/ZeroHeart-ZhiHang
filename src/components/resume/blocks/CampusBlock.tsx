"use client";

import { useState, useEffect } from "react";
import { CampusBlock as CampusBlockType } from "@/lib/resume/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { useResumeStore } from "@/stores/resume";
import { defaultCampus } from "@/lib/resume/types";

interface CampusBlockProps {
  data: CampusBlockType[];
}

function formatDateForInput(dateStr: string): string {
  if (!dateStr) return "";
  if (dateStr.includes("-")) return dateStr;
  return dateStr;
}

export function CampusBlockEditor({ data }: CampusBlockProps) {
  const { updateContent } = useResumeStore();
  const [localData, setLocalData] = useState<CampusBlockType[]>(data);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    setLocalData(data);
    if (data.length > 0) {
      setExpandedItems(new Set(Array.from({ length: data.length }, (_, i) => i)));
    }
  }, [data]);

  const toggleExpand = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  const handleChange = (index: number, field: keyof CampusBlockType, value: string) => {
    const newData = [...localData];
    newData[index] = { ...newData[index], [field]: value };
    setLocalData(newData);
  };

  const handleDateChange = (index: number, field: "startDate" | "endDate", value: string) => {
    handleChange(index, field, value);
    const newData = localData.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    updateContent({ campus: newData });
  };

  const handleBlur = (index: number, field: keyof CampusBlockType, value: string) => {
    if (data[index]?.[field] !== value) {
      const newData = [...data];
      newData[index] = { ...newData[index], [field]: value };
      updateContent({ campus: newData });
    }
  };

  const handleAdd = () => {
    const newItem = { ...defaultCampus };
    const newIndex = localData.length;
    setLocalData([...localData, newItem]);
    updateContent({ campus: [...data, newItem] });
    setExpandedItems(new Set([...Array.from(expandedItems), newIndex]));
  };

  const handleRemove = (index: number) => {
    const newData = localData.filter((_, i) => i !== index);
    setLocalData(newData);
    updateContent({ campus: data.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900">校园经历</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleAdd}
          className="hover:scale-105 transition-transform"
          style={{ 
            background: "rgba(255, 255, 255, 0.5)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderColor: "rgba(255, 154, 158, 0.3)",
          }}
        >
          <Plus className="h-4 w-4 mr-1" />
          添加
        </Button>
      </div>
      {localData.length === 0 && (
        <div className="text-center py-8 rounded-3xl" style={{ 
          background: "rgba(255, 255, 255, 0.4)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(255, 154, 158, 0.15)",
        }}>
          <p className="text-sm text-gray-500">暂无校园经历，点击添加</p>
        </div>
      )}
      {localData.map((item, index) => (
        <div key={index} className="rounded-3xl overflow-hidden transition-all duration-300" style={{ 
          background: "rgba(255, 255, 255, 0.55)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 154, 158, 0.2)",
        }}>
          <div
            className="flex items-center gap-2 p-4 cursor-pointer transition-all hover:bg-white/30"
            onClick={() => toggleExpand(index)}
          >
            <Button variant="ghost" size="sm" className="p-0 h-6 w-6">
              {expandedItems.has(index) ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
            <span className="flex-1 text-sm font-medium text-gray-800">
              {item.organization || `校园经历 ${index + 1}`}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500 h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove(index);
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
          {expandedItems.has(index) && (
            <div className="p-5 space-y-4 border-t" style={{ borderColor: "rgba(255, 154, 158, 0.15)" }}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">组织</label>
                  <Input
                    value={item.organization}
                    onChange={(e) => handleChange(index, "organization", e.target.value)}
                    onBlur={(e) => handleBlur(index, "organization", e.target.value)}
                    placeholder="学生会/社团/班级"
                    style={{ 
                      background: "rgba(255, 255, 255, 0.6)",
                      backdropFilter: "blur(8px)",
                      WebkitBackdropFilter: "blur(8px)",
                      borderColor: "rgba(255, 154, 158, 0.25)",
                    }}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">职务</label>
                  <Input
                    value={item.position}
                    onChange={(e) => handleChange(index, "position", e.target.value)}
                    onBlur={(e) => handleBlur(index, "position", e.target.value)}
                    placeholder="主席/部长/干事"
                    style={{ 
                      background: "rgba(255, 255, 255, 0.6)",
                      backdropFilter: "blur(8px)",
                      WebkitBackdropFilter: "blur(8px)",
                      borderColor: "rgba(255, 154, 158, 0.25)",
                    }}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">开始月份</label>
                  <Input
                    type="month"
                    value={formatDateForInput(item.startDate)}
                    onChange={(e) => handleDateChange(index, "startDate", e.target.value)}
                    style={{ 
                      background: "rgba(255, 255, 255, 0.6)",
                      backdropFilter: "blur(8px)",
                      WebkitBackdropFilter: "blur(8px)",
                      borderColor: "rgba(255, 154, 158, 0.25)",
                    }}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">结束月份</label>
                  <Input
                    type="month"
                    value={formatDateForInput(item.endDate)}
                    onChange={(e) => handleDateChange(index, "endDate", e.target.value)}
                    style={{ 
                      background: "rgba(255, 255, 255, 0.6)",
                      backdropFilter: "blur(8px)",
                      WebkitBackdropFilter: "blur(8px)",
                      borderColor: "rgba(255, 154, 158, 0.25)",
                    }}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-2 block">经历描述</label>
                <Textarea
                  value={item.description}
                  onChange={(e) => handleChange(index, "description", e.target.value)}
                  onBlur={(e) => handleBlur(index, "description", e.target.value)}
                  placeholder="描述你在组织中的活动和成就..."
                  rows={3}
                  style={{ 
                    background: "rgba(255, 255, 255, 0.6)",
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                    borderColor: "rgba(255, 154, 158, 0.25)",
                  }}
                />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
