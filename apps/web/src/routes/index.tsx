import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  const entries = useQuery(trpc.entries.queryOptions());

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
    </div>
  );
}
