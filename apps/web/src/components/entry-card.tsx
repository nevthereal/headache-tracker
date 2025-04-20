import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "./ui/button";
import { useMutation } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { Trash2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type EntryCardProps = {
  notes: string | null;
  date: Date;
  rating: number;
  id: string;
};

export default function EntryCard({ notes, date, rating, id }: EntryCardProps) {
  const deleteEntryMutation = useMutation(trpc.deleteEntry.mutationOptions());

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <span className='text-muted-foreground'>
            {Intl.DateTimeFormat("en-GB", { dateStyle: "full" }).format(date)}
            :{" "}
          </span>
          <span>{rating}/5</span>
        </CardTitle>
      </CardHeader>
      <CardContent className='flex justify-between items-center'>
        <p>{notes || "No Notes"}</p>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger
              onClick={() => {
                deleteEntryMutation.mutate({ id });
              }}
              className={buttonVariants({
                variant: "destructive",
                size: "icon",
              })}
            >
              <Trash2 />
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete entry</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
