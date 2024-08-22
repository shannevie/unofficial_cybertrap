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

export default function TargetModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [targetName, setTargetName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    // Handle form submission logic here
    console.log('Target Name:', targetName);
    console.log('Description:', description);
    onClose(); // Close the modal after submission
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
              placeholder="yourdomain.com"
              value={targetName}
              className='focus:ring-green-500 focus:border-green-50'
              onChange={(e) => setTargetName(e.target.value)}
            />
          </div>
          {/* <div className="mb-4">
            <Label htmlFor="description">Description (optional)</Label>
            <textarea
              id="description"
              placeholder="Target Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              rows={3}
            />
          </div> */}
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
