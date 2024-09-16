import { useState } from 'react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";

export default function TargetModal({ isOpen, onClose, onTargetAdded }: { isOpen: boolean; onClose: () => void; onTargetAdded: () => void }) {
  const [targetName, setTargetName] = useState('');
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!targetName.trim()) {
      toast({
        title: "Error",
        description: "Target name cannot be empty! Please try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/v1/domains/create?domain=${encodeURIComponent(targetName)}`, {
        method: 'POST',
      });

      if (response.status === 201) {
        console.log('Domain successfully created');
        onTargetAdded(); // Notify parent component of the new target
        onClose();
        toast({
          title: "Success",
          description: "Target added successfully.",
        });
      } else {
        console.error('Failed to create domain');
        toast({
          title: "Error",
          description: "Failed to create domain. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Target</DialogTitle>
            <DialogDescription>
              Enter the target name below.
            </DialogDescription>
          </DialogHeader>
          <form className="mt-2" onSubmit={handleSubmit}>
            <div className="mb-4">
              <Label htmlFor="targetName">Target Name</Label>
              <Input
                id="targetName"
                type="text"
                placeholder="grab.com"
                value={targetName}
                className='focus:ring-green-500 focus:border-green-500'
                onChange={(e) => setTargetName(e.target.value)}
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Add Target
              </Button>
            </div>
          </form>
          <DialogFooter className="sm:justify-start">
            <DialogClose asChild>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Toaster />
    </>
  );
}