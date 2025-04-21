import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import EntryCard from "@/components/entry-card";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { authClient } from "@/lib/auth-client";
import { NewEntryForm } from "@/components/entry-form";

export const Route = createFileRoute("/")({
  component: HomeComponent,
  async beforeLoad() {
    if (!(await authClient.getSession()).data) throw redirect({ to: "/login" });
  },
});

function HomeComponent() {
  const entriesQuery = useQuery(trpc.entries.queryOptions());

  return (
    <div className='container mx-auto max-w-3xl px-4 py-4'>
      <h1 className='font-bold text-2xl'>Last entries:</h1>
      <NewEntryForm />
      <div>
        {entriesQuery.data && entriesQuery.data.length > 0 ? (
          <>
            {/* <Chart data={entries} /> */}
            <ul className='flex flex-col gap-2'>
              {entriesQuery.data.map((entry) => (
                <EntryCard
                  key={entry.id}
                  id={entry.id}
                  rating={entry.rating}
                  notes={entry.notes}
                  date={new Date(entry.date)}
                />
              ))}
            </ul>
          </>
        ) : (
          <p>No entries yet</p>
        )}
      </div>
    </div>
  );
}

function Chart({ data }: { data: { month: string; rating: number }[] }) {
  const chartConfig = {
    rating: {
      label: "Rating",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  return (
    <ChartContainer config={chartConfig} className='min-h-[200px] w-full'>
      <AreaChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey='month'
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <Area
          dataKey='rating'
          type='natural'
          fill='var(--color-rating)'
          fillOpacity={0.4}
          stroke='var(--color-rating)'
        />
      </AreaChart>
    </ChartContainer>
  );
}
