import { neon } from "@neondatabase/serverless";
import DestinationExplorer from "@/components/DestinationExplorer";

export const dynamic = "force-dynamic";

type Destination = {
  id:string;
  slug:string;
  name:string;
  region:string;
  summary:string;
  best_time:string;
  latitude:number;
  longitude:number;
  review_count:number;
};

async function getDestinations(){
  if(!process.env.DATABASE_URL)return [];
  const sql=neon(process.env.DATABASE_URL);
  const rows=await sql`
    SELECT d.id,d.slug,d.name,d.region,d.summary,d.best_time,d.latitude,d.longitude,
      COUNT(r.id)::int AS review_count
    FROM destinations d
    LEFT JOIN reviews r ON r.destination_id=d.id
    GROUP BY d.id
    ORDER BY d.name ASC
  `;
  return rows as Destination[];
}

export default async function DestinationsPage(){
  const destinations=await getDestinations().catch(()=>[]);
  return <DestinationExplorer destinations={destinations}/>;
}
