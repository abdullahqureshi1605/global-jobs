import {redirect} from "next/navigation";export default async function CategoryJob({params}:{params:Promise<{slug:string;jobSlug:string}>}){const{jobSlug}=await params;redirect(`/jobs/${jobSlug}`)}
