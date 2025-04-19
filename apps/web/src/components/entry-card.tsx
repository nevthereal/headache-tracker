import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type EntryCardProps = {
  notes: string | null;
  date: Date;
  rating: number;
};

export default function EntryCard({ notes, date, rating }: EntryCardProps) {
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
      <CardContent>
        <p>{notes || "No Notes"}</p>
      </CardContent>
    </Card>
  );
}
