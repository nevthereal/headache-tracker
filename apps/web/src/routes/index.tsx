import {
  createFileRoute,
  redirect,
  Router,
  useRouter,
} from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import {
  createFormHook,
  createFormHookContexts,
  formOptions,
} from "@tanstack/react-form";
import type { inferInput } from "@trpc/tanstack-react-query";
import { zNewEntry } from "global";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@radix-ui/react-label";
import EntryCard from "@/components/entry-card";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";

export const Route = createFileRoute("/")({
  component: HomeComponent,
  loader: async ({ context: { queryClient } }) => {
    const entries = await queryClient.ensureQueryData(
      trpc.entries.queryOptions()
    );
    return { entries };
  },
  async beforeLoad() {
    if (!(await authClient.getSession()).data) throw redirect({ to: "/login" });
  },
});

const { fieldContext, formContext } = createFormHookContexts();

const { useAppForm } = createFormHook({
  fieldComponents: {
    Input,
    Slider,
  },
  formComponents: {
    Button,
  },
  fieldContext,
  formContext,
});

function HomeComponent() {
  const { entries } = Route.useLoaderData();

  return (
    <div className='container mx-auto max-w-3xl px-4 py-4'>
      <h1 className='font-bold text-2xl'>Last entries:</h1>
      <NewEntryForm />
      {entries ? (
        <>
          {/* <Chart data={entries} /> */}
          <ul className='flex flex-col gap-2'>
            {entries.map((entry) => (
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
        <p>No entries found</p>
      )}
    </div>
  );
}

function NewEntryForm() {
  type Input = inferInput<typeof trpc.newEntry>;

  const inputs: Input = {
    rating: 0,
    notes: "",
  };

  const formOpts = formOptions({
    defaultValues: inputs,
  });

  const router = useRouter();
  const queryClient = useQueryClient();

  const [limited, setLimited] = useState(false);

  const newEntryMutation = useMutation(
    trpc.newEntry.mutationOptions({
      onSuccess: async (newEntry) => {
        const key = trpc.entries.queryKey();

        queryClient.setQueryData(key, (oldData) => {
          if (!oldData) return;
          return [...newEntry, ...oldData];
        });

        router.invalidate();
      },
      onError: (error) => {
        if (error.data?.httpStatus === 429) {
          setLimited(true);
        }
      },
    })
  );

  const form = useAppForm({
    ...formOpts,
    async onSubmit({ value }) {
      await newEntryMutation.mutateAsync(value);
    },
    validators: {
      onChange: zNewEntry,
    },
  });

  return (
    <div className='my-4 border-accent border bg-card p-8 rounded-xl'>
      <h2 className='font-bold text-xl mb-4'>New entry</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
        className='flex flex-col gap-4'
      >
        <form.AppField name='rating'>
          {(field) => (
            <div>
              <Label htmlFor='rating'>Rating ({field.state.value})</Label>
              <field.Slider
                onBlur={field.handleBlur}
                max={5}
                onValueChange={(e) => field.handleChange(e[0])}
                className='mt-2'
              />
            </div>
          )}
        </form.AppField>
        <form.AppField name='notes'>
          {(field) => (
            <div>
              <Label htmlFor='notes'>Notes</Label>
              <field.Input
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </div>
          )}
        </form.AppField>
        <form.AppForm>
          <form.Button
            type='submit'
            disabled={!form.state.canSubmit || form.state.isSubmitting}
          >
            Submit
          </form.Button>
        </form.AppForm>
      </form>
      {limited && (
        <p className='text-destructive mt-1'>
          You have reached the rate limit for new entries.
        </p>
      )}
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
