


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";





SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."songs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "artist" "text" NOT NULL,
    "description" "text",
    "cover_url" "text",
    "audio_url" "text",
    "lyrics_file_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."songs" OWNER TO "postgres";


ALTER TABLE ONLY "public"."songs"
    ADD CONSTRAINT "songs_pkey" PRIMARY KEY ("id");



CREATE POLICY "Allow authenticated users to insert songs" ON "public"."songs" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow authenticated users to select songs" ON "public"."songs" FOR SELECT USING (true);





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";





































































































































































GRANT ALL ON TABLE "public"."songs" TO "anon";
GRANT ALL ON TABLE "public"."songs" TO "authenticated";
GRANT ALL ON TABLE "public"."songs" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































drop extension if exists "pg_net";


  create policy "Allow All For Authenticated Users 1o4vxz4_0"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using ((bucket_id = 'audio-files'::text));



  create policy "Allow All For Authenticated Users 1o4vxz4_1"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check ((bucket_id = 'audio-files'::text));



  create policy "Allow All For Authenticated Users 1o4vxz4_2"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using ((bucket_id = 'audio-files'::text));



  create policy "Allow All For Authenticated Users 1o4vxz4_3"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using ((bucket_id = 'audio-files'::text));



  create policy "Allow All For Authenticated Users fra30a_0"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using ((bucket_id = 'album-covers'::text));



  create policy "Allow All For Authenticated Users fra30a_1"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check ((bucket_id = 'album-covers'::text));



  create policy "Allow All For Authenticated Users fra30a_2"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using ((bucket_id = 'album-covers'::text));



  create policy "Allow All For Authenticated Users fra30a_3"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using ((bucket_id = 'album-covers'::text));



  create policy "Allow All For Authenticated Users xtrgwu_0"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using ((bucket_id = 'lyrics-files'::text));



  create policy "Allow All For Authenticated Users xtrgwu_1"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check ((bucket_id = 'lyrics-files'::text));



  create policy "Allow All For Authenticated Users xtrgwu_2"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using ((bucket_id = 'lyrics-files'::text));



  create policy "Allow All For Authenticated Users xtrgwu_3"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using ((bucket_id = 'lyrics-files'::text));



  create policy "Allow uploads album covers"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check ((bucket_id = 'album-covers'::text));



  create policy "Allow uploads audio"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check ((bucket_id = 'audio-files'::text));



  create policy "Allow uploads lyrics"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check ((bucket_id = 'lyrics-files'::text));



  create policy "Public read album covers"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'album-covers'::text));



  create policy "Public read audio"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'audio-files'::text));



  create policy "Public read lyrics"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'lyrics-files'::text));



