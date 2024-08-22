"use client"

import TargetsTable from "@/app/ui/targets/table";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BoltIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import TargetModal from '../../ui/components/target-modal';


export default function Targets() {

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);


    return (
        <div>
          <b>Targets</b>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => handleOpenModal()}
                className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
              >
                <BoltIcon className="h-4 w-4 text-white" />
                <span>Add Target</span>
              </Button>
            </DialogTrigger>
            <TargetModal isOpen={isModalOpen} onClose={handleCloseModal} />
          </Dialog>

          <TargetsTable query="" currentPage={1} />
        </div>
      );


}