import dotenv from "dotenv";

dotenv.config({
  path: ".env.local",
});

import { createClient } from "@supabase/supabase-js";
import { jobs } from "../data/jobs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL in .env.local"
  );
}

if (!supabaseSecretKey) {
  throw new Error(
    "Missing SUPABASE_SECRET_KEY in .env.local"
  );
}

const supabase = createClient(
  supabaseUrl,
  supabaseSecretKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

async function seedJobs() {
  console.log(`Preparing to migrate ${jobs.length} jobs...`);

  const rows = jobs.map((job) => ({
    id: job.id,
    title: job.title,
    slug: job.slug,
    company: job.company,
    company_logo: job.companyLogo || null,

    country: job.country,
    country_code: job.countryCode,
    city: job.city,

    category: job.category,
    subcategory: job.subcategory || null,
    industry: job.industry || null,

    employment_type: job.employmentType,
    workplace_type: job.workplaceType,
    experience_level: job.experienceLevel,

    salary_min: job.salaryMin ?? null,
    salary_max: job.salaryMax ?? null,
    salary_currency: job.salaryCurrency || null,
    salary_period: job.salaryPeriod || null,

    description: job.description,

    requirements: job.requirements || [],
    responsibilities: job.responsibilities || [],
    benefits: job.benefits || [],

    source_name: job.sourceName,
    source_url: job.sourceUrl,
    apply_url: job.applyUrl,

    date_posted: job.datePosted,
    closing_date: job.closingDate || null,
    last_verified: job.lastVerified || null,

    verification_status:
      job.verificationStatus,

    status: job.status,

    featured: job.featured ?? false,
  }));

  const { data, error } = await supabase
    .from("jobs")
    .upsert(rows, {
      onConflict: "id",
    })
    .select("id, title, status");

  if (error) {
    console.error("Migration failed:");
    console.error(error);
    process.exit(1);
  }

  console.log(
    `Successfully migrated ${data?.length ?? 0} jobs.`
  );

  console.table(data);
}

seedJobs().catch((error) => {
  console.error("Unexpected migration error:");
  console.error(error);
  process.exit(1);
});