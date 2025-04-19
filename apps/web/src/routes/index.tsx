import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import {
  createFormHook,
  createFormHookContexts,
  formOptions,
} from "@tanstack/react-form";
import type { inferInput } from "@trpc/tanstack-react-query";
import { zNewEntry } from "../../../server/src/lib/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@radix-ui/react-label";
import EntryCard from "@/components/entry-card";

export const Route = createFileRoute("/")({
  component: HomeComponent,
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
  const entries = useQuery(trpc.entries.queryOptions());

  type Input = inferInput<typeof trpc.newEntry>;

  const inputs: Input = {
    rating: 0,
    notes: "",
  };

  const formOpts = formOptions({
    defaultValues: inputs,
  });

  const mutation = useMutation(trpc.newEntry.mutationOptions());

  const form = useAppForm({
    ...formOpts,
    async onSubmit({ value }) {
      await mutation.mutateAsync(value);
    },
    validators: {
      onChange: zNewEntry,
    },
  });

  return (
    <div className='container mx-auto max-w-3xl px-4 py-4'>
      <h1 className='font-bold text-2xl'>Last entries:</h1>
      <div className='my-4 border-accent border bg-card p-8 rounded-xl'>
        <h2 className='font-bold text-xl mb-4'>New entry</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className='flex flex-col gap-4'
        >
          <form.AppField
            name='rating'
            // biome-ignore lint/correctness/noChildrenProp: <explanation>
            children={(field) => (
              <div>
                <Label htmlFor='rating'>Rating</Label>
                <field.Slider
                  onBlur={field.handleBlur}
                  max={5}
                  onValueChange={(e) => field.handleChange(e)}
                  className='mt-2'
                />
              </div>
            )}
          />
          <form.AppField
            name='notes'
            // biome-ignore lint/correctness/noChildrenProp: <explanation>
            children={(field) => (
              <div>
                <Label htmlFor='notes'>Notes</Label>
                <field.Input
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          />
          <form.AppForm>
            <form.Button type='submit' disabled={form.state.isSubmitting}>
              Submit
            </form.Button>
          </form.AppForm>
        </form>
      </div>

      {entries.isLoading ? (
        <p>Loading...</p>
      ) : entries.data ? (
        <ul>
          {entries.data?.map((entry) => (
            <EntryCard
              key={entry.id}
              rating={entry.rating}
              notes={entry.notes}
              date={new Date(entry.date)}
            />
          ))}
        </ul>
      ) : (
        <p>No entries found</p>
      )}
    </div>
  );
}
