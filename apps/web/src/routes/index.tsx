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

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

const { fieldContext, formContext } = createFormHookContexts();

const { useAppForm } = createFormHook({
  fieldComponents: {
    Input,
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
      mutation.mutate(value);
    },
    validators: {
      onChange: zNewEntry,
    },
  });

  return (
    <div className='container mx-auto max-w-3xl px-4 py-2'>
      <h1 className='font-bold text-2xl'>Letzte Einträge:</h1>

      {entries.isLoading ? (
        <p>Loading...</p>
      ) : entries.data ? (
        <ul>
          {entries.data?.map((entry) => (
            <li key={entry.id}>
              {Intl.DateTimeFormat().format(new Date(entry.date))}
            </li>
          ))}
        </ul>
      ) : (
        <p>No entries found</p>
      )}

      <form onSubmit={form.handleSubmit}>
        <form.AppField
          name='rating'
          // biome-ignore lint/correctness/noChildrenProp: <explanation>
          children={(field) => (
            <>
              <field.Input
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(Number(e.target.value))}
              />
            </>
          )}
        />
        <form.AppField
          name='notes'
          // biome-ignore lint/correctness/noChildrenProp: <explanation>
          children={(field) => (
            <>
              <field.Input
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </>
          )}
        />
        <button type='submit'>Submit</button>
      </form>
    </div>
  );
}
