import { trpc } from "@/utils/trpc";
import {
  createFormHook,
  createFormHookContexts,
  formOptions,
} from "@tanstack/react-form";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import type { inferInput } from "@trpc/tanstack-react-query";
import { zNewEntry } from "global";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

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

export function NewEntryForm() {
  const inputs: inferInput<typeof trpc.newEntry> = {
    rating: 0,
    notes: "",
  };

  const formOpts = formOptions({
    defaultValues: inputs,
  });

  const queryClient = useQueryClient();

  const newEntryMutation = useMutation(
    trpc.newEntry.mutationOptions({
      onSuccess: async () => {
        queryClient.invalidateQueries({
          queryKey: trpc.entries.queryKey(),
        });
        form.reset(inputs);
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
        className='flex flex-col gap-2'
      >
        <form.AppField name='rating'>
          {(field) => (
            <div className='mb-2'>
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
              <Label htmlFor='notes' className='mb-1'>
                Notes
              </Label>
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
            size='lg'
          >
            Submit
          </form.Button>
        </form.AppForm>
      </form>
      {newEntryMutation.isError && (
        <p className='text-destructive mt-1'>
          {newEntryMutation.error.message}
        </p>
      )}
    </div>
  );
}
