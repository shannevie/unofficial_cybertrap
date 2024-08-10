import TargetsTable from "@/app/ui/targets/table";

export default function Targets() {
    return (
        <div>
          <b>Targets</b>
          <TargetsTable query="" currentPage={1} />
        </div>
      );


}