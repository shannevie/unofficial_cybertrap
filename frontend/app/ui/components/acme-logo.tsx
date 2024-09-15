import { CubeTransparentIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/components/fonts';

export default function AcmeLogo() {
  return (
    <div
      className={`${lusitana.className} flex flex-row items-center leading-none text-white`}
    >
      <CubeTransparentIcon className="h-12 w-12 mx-2 rotate-[15deg]" />
      <p className="text-[36px]">CyberTrap</p>
    </div>
  );
}
