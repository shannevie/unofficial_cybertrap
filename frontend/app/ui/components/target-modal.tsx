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

export default function TargetModal({ isOpen, onClose, onTargetAdded }: { isOpen: boolean; onClose: () => void; onTargetAdded: () => void }) {
  const [targetName, setTargetName] = useState('');

  const handleSubmit = async () => {
    console.log('Target Name:', targetName);

    try {
      const response = await fetch(`http://localhost:5000/v1/domains/create?domain=${encodeURIComponent(targetName)}`, {
        method: 'POST',
      });

      if (response.status === 201) {
        console.log('Domain successfully created');
        onTargetAdded(); // Notify parent component of the new target
        onClose(); 
      } else {
        console.error('Failed to create domain');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Target</DialogTitle>
          <DialogDescription>
            Enter the target name below.
          </DialogDescription>
        </DialogHeader>
        <form className="mt-2">
          <div className="mb-4">
            <Label htmlFor="targetName">Target Name</Label>
            <Input
              id="targetName"
              type="text"
              placeholder="grab.com"
              value={targetName}
              className='focus:ring-green-500 focus:border-green-50'
              onChange={(e) => setTargetName(e.target.value)}
            />
          </div>
          <div className="flex justify-end">
            <Button type="button" onClick={handleSubmit}
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
  );
}
