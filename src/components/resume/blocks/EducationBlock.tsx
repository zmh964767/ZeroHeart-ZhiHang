"use client";

import { useState, useEffect } from "react";
import { EducationBlock as EducationBlockType } from "@/lib/resume/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { useResumeStore } from "@/stores/resume";
import { defaultEducation } from "@/lib/resume/types";

interface EducationBlockProps {
  data: EducationBlockType[];
}

function formatDateForInput(dateStr: string): string {
  if (!dateStr) return "";
  if (dateStr.includes("-")) return dateStr;
  return dateStr;
}

export function EducationBlockEditor({ data }: EducationBlockProps) {
  const { updateContent } = useResumeStore();
  const [localData, setLocalData] = useState<EducationBlockType[]>(data);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set([0]));

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

  const handleChange = (index: number, field: keyof EducationBlockType, value: any) => {
    const newData = [...localData];
    newData[index] = { ...newData[index], [field]: value };
    setLocalData(newData);
  };

  const handleDateChange = (index: number, field: "startDate" | "endDate", value: string) => {
    handleChange(index, field, value);
    const newData = localData.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    updateContent({ education: newData });
  };

  const handleBlur = (index: number, field: keyof EducationBlockType, value: any) => {
    if (JSON.stringify(data[index]?.[field]) !== JSON.stringify(value)) {
      const newData = [...data];
      newData[index] = { ...newData[index], [field]: value };
      updateContent({ education: newData });
    }
  };

  const handleAdd = () => {
    const newItem = { ...defaultEducation };
    const newIndex = localData.length;
    setLocalData([...localData, newItem]);
    updateContent({ education: [...data, newItem] });
    setExpandedItems(new Set([...Array.from(expandedItems), newIndex]));
  };

  const handleRemove = (index: number) => {
    const newData = localData.filter((_, i) => i !== index);
    setLocalData(newData);
    updateContent({ education: data.filter((_, i) => i !== index) });
  };

  const handleCourseChange = (eduIndex: number, value: string) => {
    handleChange(eduIndex, "courses", value);
  };

  const handleCourseBlur = (eduIndex: number, value: string) => {
    handleBlur(eduIndex, "courses", value);
  };

  const handleAwardChange = (eduIndex: number, value: string) => {
    handleChange(eduIndex, "awards", value);
  };

  const handleAwardBlur = (eduIndex: number, value: string) => {
    handleBlur(eduIndex, "awards", value);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900">教育经历</h3>
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
          <p className="text-sm text-gray-500">暂无教育经历，点击添加</p>
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
              {item.school || `教育经历 ${index + 1}`}
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
            <div className="p-4 md:p-5 space-y-4 border-t" style={{ borderColor: "rgba(255, 154, 158, 0.15)" }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">学校</label>
                  <Input
                    value={item.school}
                    onChange={(e) => handleChange(index, "school", e.target.value)}
                    onBlur={(e) => handleBlur(index, "school", e.target.value)}
                    placeholder="XX大学"
                    style={{ 
                      background: "rgba(255, 255, 255, 0.6)",
                      backdropFilter: "blur(8px)",
                      WebkitBackdropFilter: "blur(8px)",
                      borderColor: "rgba(255, 154, 158, 0.25)",
                    }}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">专业</label>
                  <Input
                    value={item.major}
                    onChange={(e) => handleChange(index, "major", e.target.value)}
                    onBlur={(e) => handleBlur(index, "major", e.target.value)}
                    placeholder="计算机科学与技术"
                    style={{ 
                      background: "rgba(255, 255, 255, 0.6)",
                      backdropFilter: "blur(8px)",
                      WebkitBackdropFilter: "blur(8px)",
                      borderColor: "rgba(255, 154, 158, 0.25)",
                    }}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">学历</label>
                  <Input
                    value={item.degree}
                    onChange={(e) => handleChange(index, "degree", e.target.value)}
                    onBlur={(e) => handleBlur(index, "degree", e.target.value)}
                    placeholder="本科"
                    style={{ 
                      background: "rgba(255, 255, 255, 0.6)",
                      backdropFilter: "blur(8px)",
                      WebkitBackdropFilter: "blur(8px)",
                      borderColor: "rgba(255, 154, 158, 0.25)",
                    }}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">GPA</label>
                  <Input
                    value={item.gpa || ""}
                    onChange={(e) => handleChange(index, "gpa", e.target.value)}
                    onBlur={(e) => handleBlur(index, "gpa", e.target.value)}
                    placeholder="3.8/4.0"
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
                <label className="text-sm text-gray-600 mb-2 block">专业课程</label>
                <textarea
                  value={item.courses || ""}
                  onChange={(e) => handleCourseChange(index, e.target.value)}
                  onBlur={(e) => handleCourseBlur(index, e.target.value)}
                  placeholder="每行一个课程，数据结构、算法设计、机器学习..."
                  rows={4}
                  style={{ 
                    background: "rgba(255, 255, 255, 0.6)",
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                    borderColor: "rgba(255, 154, 158, 0.25)",
                    width: "100%",
                    padding: "0.75rem",
                    fontSize: "0.875rem",
                    borderRadius: "0.5rem",
                    resize: "none",
                    outline: "none"
                  }}
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-2 block">荣誉奖项</label>
                <textarea
                  value={item.awards || ""}
                  onChange={(e) => handleAwardChange(index, e.target.value)}
                  onBlur={(e) => handleAwardBlur(index, e.target.value)}
                  placeholder="每行一个荣誉，国家奖学金、校三好学生..."
                  rows={3}
                  style={{ 
                    background: "rgba(255, 255, 255, 0.6)",
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                    borderColor: "rgba(255, 154, 158, 0.25)",
                    width: "100%",
                    padding: "0.75rem",
                    fontSize: "0.875rem",
                    borderRadius: "0.5rem",
                    resize: "none",
                    outline: "none"
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