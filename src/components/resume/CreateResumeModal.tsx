"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useResumeStore } from "@/stores/resume";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CreateResumeModalProps {
  children: React.ReactNode;
}

export function CreateResumeModal({ children }: CreateResumeModalProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const { createResume } = useResumeStore();
  const router = useRouter();

  const handleCreate = async () => {
    if (!name.trim() || isCreating) return;

    setIsCreating(true);
    try {
      const resume = await createResume(name.trim());
      toast.success(`简历「${name.trim()}」创建成功`);
      setName("");
      setOpen(false);
      router.push(`/resume/${resume.id}`);
    } catch (error) {
      toast.error("创建简历失败，请重试");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>创建新简历</DialogTitle>
          <DialogDescription>
            为你的新简历起个名字，例如&quot;技术岗简历&quot;或&quot;产品经理简历&quot;
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <Input
            placeholder="简历名称"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            disabled={isCreating}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isCreating}>
              取消
            </Button>
            <Button onClick={handleCreate} disabled={!name.trim() || isCreating}>
              {isCreating ? "创建中..." : "创建"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
