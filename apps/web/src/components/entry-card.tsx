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
          {Intl.DateTimeFormat("en-US", { dateStyle: "full" }).format(date)}
        </CardTitle>
        <CardDescription>{rating}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>{notes || "No Notes"}</p>
      </CardContent>
    </Card>
  );
}
